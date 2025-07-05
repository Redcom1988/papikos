import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-sm dark:bg-muted/50">
                <AppLogoIcon className="size-8 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-2 grid flex-1 text-left text-lg">
                <span className="mb-01 truncate leading-none font-semibold">Papikos</span>
            </div>
        </>
    );
}
