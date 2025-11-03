// level-up-gaming-frontend/src/context/AuthContext.test.tsx

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import axios from 'axios'; // Importar el real para el mock

// 🚨 CORRECCIÓN CRÍTICA: Mocking estricto de axios
vi.mock('axios', () => ({
    // Devolvemos el módulo completo, pero mockeamos post y put
    default: {
        post: vi.fn(),
        put: vi.fn(),
        // Si usas get: get: vi.fn(),
    },
}));

// Mock del objeto axios.post para tipado
const axiosPostMock = axios.post as unknown as Mock;


// Componente que envuelve el hook
const MockWrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
);

const mockAdminData = {
    id: 'u1',
    name: 'Admin Test',
    email: 'test@admin.com',
    role: 'admin',
    token: 'TEST_TOKEN_ADMIN',
    hasDuocDiscount: true,
    points: 1000,
    referralCode: 'TEST001',
    address: { street: 'Main St', city: 'Concepcion', region: 'BioBio' },
};


describe('AuthContext: Gestión de Sesión y Persistencia', () => {
    // ... (Lógica de localStorageMock) ...
    const localStorageMock = (() => {
        let store: { [key: string]: string } = {};
        return {
            getItem: vi.fn((key: string) => store[key] || null),
            setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
            removeItem: vi.fn((key: string) => { delete store[key]; }),
            clear: vi.fn(() => { store = {}; })
        };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });


    beforeEach(() => {
        localStorageMock.clear();
        axiosPostMock.mockClear();
        localStorageMock.getItem.mockClear();
    });


    it('1. debería inicializar el estado desde el localStorage al cargar', () => {
        localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockAdminData));
        const { result } = renderHook(() => useAuth(), { wrapper: MockWrapper });
        expect(result.current.isLoggedIn).toBe(true);
    });

    it('2. la función de inicio de sesión debería tener éxito y establecer el estado del usuario', async () => {
        axiosPostMock.mockResolvedValue({ data: mockAdminData });
        const { result } = renderHook(() => useAuth(), { wrapper: MockWrapper });

        await act(async () => {
            const success = await result.current.login('test@admin.com', 'pass');
            expect(success).toBe(true);
        });

        expect(result.current.isLoggedIn).toBe(true);
        expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('3. la funcion de login deberia falla y no setear el estado', async () => {
        axiosPostMock.mockRejectedValue({ response: { status: 401 } });
        const { result } = renderHook(() => useAuth(), { wrapper: MockWrapper });

        await act(async () => {
            const success = await result.current.login('wrong@email.com', 'pass');
            expect(success).toBe(false);
        });

        expect(result.current.isLoggedIn).toBe(false);
        expect(localStorageMock.removeItem).toHaveBeenCalled();
    });

    it('4. la funcion de logout deberia limpiar el estado de usuario en el localstorage', () => {
        localStorageMock.setItem('user', JSON.stringify(mockAdminData));
        const { result } = renderHook(() => useAuth(), { wrapper: MockWrapper });

        act(() => {
            result.current.logout();
        });

        expect(result.current.isLoggedIn).toBe(false);
        expect(localStorageMock.removeItem).toHaveBeenCalled();
    });

    it('5. la función de registro debería tener éxito y establecer el estado del usuario', async () => {
        axiosPostMock.mockResolvedValue({ data: mockAdminData });
        const { result } = renderHook(() => useAuth(), { wrapper: MockWrapper });

        await act(async () => {
            const success = await result.current.register('test@admin.com', 'pass', 'Admin Test');
            expect(success).toBe(true);
        });

        expect(result.current.isLoggedIn).toBe(true);
        expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('6. la función de actualización de perfil debería tener éxito y actualizar el estado del usuario', async () => {
        localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(mockAdminData));
        const { result } = renderHook(() => useAuth(), { wrapper: MockWrapper });

        const updatedUser = { ...mockAdminData, name: 'Updated Name' };
        (axios.put as unknown as Mock).mockResolvedValue({ data: updatedUser });

        await act(async () => {
            await result.current.updateProfile({ name: 'Updated Name' });
        });

        expect(result.current.user?.name).toBe('Updated Name');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(updatedUser));
    });
});