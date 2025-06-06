import * as React from 'react';
import {
    type ComponentsOverrides,
    styled,
    type SxProps,
    type Theme,
    useThemeProps,
} from '@mui/material/styles';
import { Button, CardContent, CircularProgress } from '@mui/material';
import { Form, required, useTranslate, useLogin, useNotify } from 'ra-core';
import { PasswordInput, TextInput } from '../input';

export const LoginForm = (inProps: LoginFormProps) => {
    const props = useThemeProps({
        props: inProps,
        name: PREFIX,
    });
    const { redirectTo, className, sx, children } = props;
    const [loading, setLoading] = React.useState(false);
    const login = useLogin();
    const translate = useTranslate();
    const notify = useNotify();

    const submit = (values: FormData) => {
        setLoading(true);
        login(values, redirectTo)
            .then(() => {
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                notify(
                    typeof error === 'string'
                        ? error
                        : typeof error === 'undefined' || !error.message
                          ? 'ra.auth.sign_in_error'
                          : error.message,
                    {
                        type: 'error',
                        messageArgs: {
                            _:
                                typeof error === 'string'
                                    ? error
                                    : error && error.message
                                      ? error.message
                                      : undefined,
                        },
                    }
                );
            });
    };

    return (
        <StyledForm
            onSubmit={submit}
            mode="onChange"
            noValidate
            className={className}
            sx={sx}
        >
            <CardContent className={LoginFormClasses.content}>
                {children || (
                    <>
                        <TextInput
                            autoFocus
                            source="username"
                            label={translate('ra.auth.username')}
                            autoComplete="username"
                            validate={required()}
                        />
                        <PasswordInput
                            source="password"
                            label={translate('ra.auth.password')}
                            autoComplete="current-password"
                            validate={required()}
                        />
                    </>
                )}

                <Button
                    variant="contained"
                    type="submit"
                    color="primary"
                    disabled={loading}
                    fullWidth
                    className={LoginFormClasses.button}
                >
                    {loading ? (
                        <CircularProgress
                            className={LoginFormClasses.icon}
                            size={19}
                            thickness={3}
                        />
                    ) : (
                        translate('ra.auth.sign_in')
                    )}
                </Button>
            </CardContent>
        </StyledForm>
    );
};

const PREFIX = 'RaLoginForm';

export const LoginFormClasses = {
    content: `${PREFIX}-content`,
    button: `${PREFIX}-button`,
    icon: `${PREFIX}-icon`,
};

const StyledForm = styled(Form, {
    name: PREFIX,
    overridesResolver: (props, styles) => styles.root,
})(({ theme }) => ({
    [`& .${LoginFormClasses.content}`]: {
        width: 300,
        paddingBottom: `${theme.spacing(2)}!important`,
    },
    [`& .${LoginFormClasses.button}`]: {
        marginTop: theme.spacing(2),
    },
    [`& .${LoginFormClasses.icon}`]: {
        margin: theme.spacing(0.3),
    },
}));

export interface LoginFormProps {
    redirectTo?: string;
    className?: string;
    sx?: SxProps<Theme>;
    children?: React.ReactNode;
}

interface FormData {
    username: string;
    password: string;
}

declare module '@mui/material/styles' {
    interface ComponentNameToClassKey {
        RaLoginForm: 'root' | 'content' | 'button' | 'icon';
    }

    interface ComponentsPropsList {
        RaLoginForm: Partial<LoginFormProps>;
    }

    interface Components {
        RaLoginForm?: {
            defaultProps?: ComponentsPropsList['RaLoginForm'];
            styleOverrides?: ComponentsOverrides<
                Omit<Theme, 'components'>
            >['RaLoginForm'];
        };
    }
}
