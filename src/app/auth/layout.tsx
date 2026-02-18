export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="auth-layout">
            <div className="auth-layout-bg">
                <div className="auth-blob red"></div>
                <div className="auth-blob gold"></div>
                <div className="auth-blob green"></div>
            </div>
            <div className="auth-container">
                {children}
            </div>
        </div>
    );
}
