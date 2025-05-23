import * as React from 'react';
import { type MouseEvent, type ReactNode, useState } from 'react';
import { useLocaleState, useLocales } from 'ra-core';
import {
    Box,
    Button,
    type ComponentsOverrides,
    Menu,
    MenuItem,
    styled,
    useThemeProps,
} from '@mui/material';
import LanguageIcon from '@mui/icons-material/Translate';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

/**
 * Language selector. Changes the locale in the app and persists it in
 * preferences so that the app opens with the right locale in the future.
 *
 * Uses i18nProvider.getLocales() to get the list of available locales.
 *
 * @example
 * import { AppBar, TitlePortal, LocalesMenuButton } from 'react-admin';
 *
 * const MyAppBar = () => (
 *     <AppBar>
 *         <TitlePortal />
 *         <LocalesMenuButton />
 *     </AppBar>
 * );
 */
export const LocalesMenuButton = (inProps: LocalesMenuButtonProps) => {
    const props = useThemeProps({
        props: inProps,
        name: PREFIX,
    });
    const { icon = DefaultIcon, languages: languagesProp } = props;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const languages = useLocales({ locales: languagesProp });
    const [locale, setLocale] = useLocaleState();

    const getNameForLocale = (locale: string): string => {
        const language = languages.find(language => language.locale === locale);
        return language ? language.name : '';
    };

    const changeLocale = (locale: string) => (): void => {
        setLocale(locale);
        setAnchorEl(null);
    };

    const handleLanguageClick = (event: MouseEvent<HTMLElement>): void => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (): void => {
        setAnchorEl(null);
    };

    return (
        <Root component="span">
            <Button
                color="inherit"
                variant="text"
                aria-controls="simple-menu"
                aria-label=""
                aria-haspopup="true"
                onClick={handleLanguageClick}
                startIcon={icon}
                endIcon={<ExpandMoreIcon fontSize="small" />}
            >
                {getNameForLocale(locale)}
            </Button>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {languages.map(language => (
                    <MenuItem
                        key={language.locale}
                        onClick={changeLocale(language.locale)}
                        selected={language.locale === locale}
                    >
                        {language.name}
                    </MenuItem>
                ))}
            </Menu>
        </Root>
    );
};

const DefaultIcon = <LanguageIcon />;
const PREFIX = 'RaLocalesMenuButton';

export const LocalesMenuButtonClasses = {};

const Root = styled('span', {
    name: PREFIX,
    overridesResolver: (props, styles) => styles.root,
})({}) as typeof Box;

export interface LocalesMenuButtonProps {
    icon?: ReactNode;
    languages?: { locale: string; name: string }[];
}

declare module '@mui/material/styles' {
    interface ComponentNameToClassKey {
        RaLocalesMenuButton: 'root';
    }

    interface ComponentsPropsList {
        RaLocalesMenuButton: Partial<LocalesMenuButtonProps>;
    }

    interface Components {
        RaLocalesMenuButton?: {
            defaultProps?: ComponentsPropsList['RaLocalesMenuButton'];
            styleOverrides?: ComponentsOverrides<
                Omit<Theme, 'components'>
            >['RaLocalesMenuButton'];
        };
    }
}
