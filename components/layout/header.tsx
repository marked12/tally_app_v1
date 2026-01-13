export function Header({ children }: { children?: React.ReactNode }) {
    return (
        <header className="sticky top-0 z-50 flex h-14 items-center border-b bg-background px-4">
            {children}
        </header>
    )
}
