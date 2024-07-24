import { useLocation } from 'react-router-dom'

export function useIsVaultsPage() {
    const { pathname } = useLocation()
    return (
        pathname.startsWith('/vaults') ||
        pathname.startsWith('/vault')
    )
}
