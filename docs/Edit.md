---
layout: default
title: "The Edit Component"
storybook_path: ra-ui-materialui-detail-edit--basic
---

# `<Edit>`

The `<Edit>` component is the main component for edition pages. It fetches a record based on the URL, prepares a form submit handler, and renders the page title and actions. It is not responsible for rendering the actual form - that's the job of its child component (usually a form component, like [`<SimpleForm>`](./SimpleForm.md)). This form component uses its children ([`<Input>`](./Inputs.md) components) to render each form input.

<iframe src="https://www.youtube-nocookie.com/embed/FTSSwE6Ks4c?si=qKOlIiAczSbfJWQg" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="aspect-ratio: 16 / 9;width:100%;margin-bottom:1em;"></iframe>

The `<Edit>` component calls `dataProvider.getOne()`, using the `id` from the URL. It creates a `RecordContext` with the result. It also creates a [`SaveContext`](./useSaveContext.md) containing a `save` callback, which calls `dataProvider.update()` when executed, and [an `EditContext`](./useEditContext.md) containing both the record and the callback.

## Usage

Wrap the `<Edit>` component around the form you want to create, then pass it as `edit` prop of a given `<Resource>`. `<Edit>` requires no prop by default - it deduces the `resource` and the `id` from the current URL.

For instance, the following component will render an edition form for posts when users browse to `/posts/edit/1234`:

```jsx
// in src/posts.js
import { Edit, SimpleForm, TextInput, DateInput, ReferenceManyField, DataTable, DateField, EditButton, required } from 'react-admin';
import RichTextInput from 'ra-input-rich-text';

export const PostEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput disabled label="Id" source="id" />
            <TextInput source="title" validate={required()} />
            <TextInput multiline source="teaser" validate={required()} />
            <RichTextInput source="body" validate={required()} />
            <DateInput label="Publication date" source="published_at" />
            <ReferenceManyField label="Comments" reference="comments" target="post_id">
                <DataTable>
                    <DataTable.Col source="body" />
                    <DataTable.Col source="created_at" field={DateField} />
                    <DataTable.Col>
                        <EditButton />
                    </DataTable.Col>
                </DataTable>
            </ReferenceManyField>
        </SimpleForm>
    </Edit>
);

// in src/App.js
import { Admin, Resource } from 'react-admin';

import { dataProvider } from './dataProvider';
import { PostEdit } from './posts';

const App = () => (
    <Admin dataProvider={dataProvider}>
        <Resource name="posts" edit={PostEdit} />
    </Admin>
);

export default App;
```

## Props

You can customize the `<Edit>` component using the following props:

| Prop                  | Required  | Type                | Default      | Description                                                                                   |
|-----------------------|-----------|---------------------|--------------|-----------------------------------------------------------------------------------------------|
| `children`            | Optional&nbsp;*  | `ReactNode`         | -            | The components that render the form                                                            |
| `render`              | Optional&nbsp;* | `function`          | -            | Function to render the form, receives the editContext as argument                              |
| `actions`             | Optional  | `ReactNode`         | -            | Override the actions toolbar with a custom component                                           |
| `aside`               | Optional  | `ReactNode`         | -            | Component to render aside to the main content                                                  |
| `className`           | Optional  | `string`            | -            | Passed to the root component                                                                  |
| `component`           | Optional  | `elementType`/`string` | `Card`     | Override the root component                                                                   |
| `disableAuthentication`| Optional | `boolean`           | `false`      | Disable the authentication check                                                              |
| `emptyWhileLoading`   | Optional  | `boolean`           | `false`      | Set to `true` to return `null` while the edit is loading                                      |
| `id`                  | Optional  | `string`/`number`   | -            | The id of the record to edit                                                                  |
| `mutationMode`        | Optional  | `'undoable' \| 'optimistic' \| 'pessimistic'` | `'undoable'` | Switch to optimistic or pessimistic mutations                                                 |
| `mutationOptions`     | Optional  | `object`            | -            | Options for the `dataProvider.update()` call                                                  |
| `queryOptions`        | Optional  | `object`            | -            | Options for the `dataProvider.getOne()` call                                                  |
| `redirect`            | Optional  | `'list' \| 'show' \| false \| function` | `'list'` | Change the redirect location after successful update                                           |
| `resource`            | Optional  | `string`            | -            | Override the name of the resource to edit                                                     |
| `sx`                  | Optional  | `object`            | -            | Override the styles                                                                           |
| `title`               | Optional  | `string`/`ReactNode`/`false` | -      | Override the page title                                                                       |
| `transform`           | Optional  | `function`          | -            | Transform the form data before calling `dataProvider.update()`                                |

`*` You must provide either `children` or `render`.

## `actions`

You can replace the list of default actions by your own elements using the `actions` prop:

```jsx
import * as React from "react";
import Button from '@mui/material/Button';
import { TopToolbar, ListButton, ShowButton, Edit } from 'react-admin';

const PostEditActions = () => (
    <TopToolbar>
        <ShowButton />
        {/* Add your custom actions */}
        <ListButton />
        <Button color="primary" onClick={customAction}>Custom Action</Button>
    </TopToolbar>
);

export const PostEdit = () => (
    <Edit actions={<PostEditActions />}>
        ...
    </Edit>
);
```

Common buttons used as Edit actions are:

* [`<CreateButton>`](./Buttons.md#createbutton) to create a new record
* [`<ListButton>`](./Buttons.md#listbutton) to go back to the list
* [`<ShowButton>`](./Buttons.md#showbutton) to go to the show page
* [`<UpdateButton>`](./UpdateButton.md) to trigger a change in the data
* [`<CloneButton>`](./Buttons.md#clonebutton) to clone the current record

And you can add your own button, leveraging the `useRecordContext()` hook:

```jsx
import * as React from "react";
import { useRecordContext, useUpdate, useNotify } from 'react-admin';

const ResetViewsButton = () => {
    const record = useRecordContext();
    const [update, { isPending }] = useUpdate();
    const notify  = useNotify();
    const handleClick = () => {
        update(
            'posts',
            { id: record.id, data: { views: 0 }, previousData: record },
            {
                onSuccess: () => {
                    notify('Views reset');
                },
                onFailure: error => notify(`Error: ${error.message}`, 'warning'),
            }
        );
    };
    return (
        <Button onClick={handleClick} disabled={isPending}>
            Reset views
        </Button>
    );
};
```

## `aside`

![Aside component](./img/aside.png)

You may want to display additional information on the side of the form. Use the `aside` prop for that, passing the component of your choice:

{% raw %}

```jsx
const Aside = () => (
    <Box sx={{ width: '200px', margin: '1em' }}>
        <Typography variant="h6">Instructions</Typography>
        <Typography variant="body2">
            Posts will only be published once an editor approves them
        </Typography>
    </Box>
);

const PostEdit = () => (
    <Edit aside={<Aside />}>
       // ...
    </Edit>
);
```

{% endraw %}

The aside component renders in the same `RecordContext` as the `Edit` child component. That means you can display non-editable details of the current `record` in the aside component:

{% raw %}

```jsx
const Aside = () => {
    const record = useRecordContext();
    return (
        <div style={{ width: 200, margin: '1em' }}>
            <Typography variant="h6">Post details</Typography>
            {record && (
                <Typography variant="body2">
                    Creation date: {record.createdAt}
                </Typography>
            )}
        </div>
    );
};
```

{% endraw %}

**Tip**: Always test the record is defined before using it, as react-admin starts rendering the UI before the `dataProvider.getOne()` call is over.

## `children`

The `<Edit>` component will render its children inside a `EditContext` provider, which the `save` function. Children can be any React node, but are usually a form component like [`<SimpleForm>`](./SimpleForm.md), [`<TabbedForm>`](./TabbedForm.md), or the headless [`<Form>`](./Form.md) component.

```tsx
import { 
    Edit,
    DateInput,
    SimpleForm,
    TextInput,
    required
} from 'react-admin';
import RichTextInput from 'ra-input-rich-text';

export const PostEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput disabled label="Id" source="id" />
            <TextInput source="title" validate={required()} />
            <TextInput multiline source="teaser" validate={required()} />
            <RichTextInput source="body" validate={required()} />
            <DateInput label="Publication date" source="published_at" />
        </SimpleForm>
    </Edit>
);
```

**Tip**: Alternatively to `children`, you can pass a [`render`](#render) prop to `<Edit>`.

## `component`

By default, the `<Edit>` view render the main form inside a Material UI `<Card>` element. The actual layout of the form depends on the `Form` component you're using ([`<SimpleForm>`](./SimpleForm.md), [`<TabbedForm>`](./TabbedForm.md), or a custom form component).

Some form layouts also use `Card`, in which case the user ends up seeing a card inside a card, which is bad UI. To avoid that, you can override the main page container by passing a `component` prop :

```jsx
// use a div as root component
const PostEdit = () => (
    <Edit component="div">
        ...
    </Edit>
);

// use a custom component as root component 
const PostEdit = () => (
    <Edit component={MyComponent}>
        ...
    </Edit>
);
```

The default value for the `component` prop is `Card`.

## `disableAuthentication`

By default, the `<Edit>` component will automatically redirect the user to the login page if the user is not authenticated. If you want to disable this behavior and allow anonymous access to a creation page, set the `disableAuthentication` prop to `true`.

```jsx
const PostEdit = () => (
    <Edit disableAuthentication>
        ...
    </Edit>
);
```

## `emptyWhileLoading`

By default, `<Edit>` doesn't render its child component even before the `dataProvider.getOne()` call returns, but it returns its [`aside`](#aside), [`actions`](#actions) and [`title`](#title) components.

If a component you use in those props relies on the record, it will throw an error. For instance, the following will fail on load with a "ReferenceError: record is not defined" error:

```jsx
import { Edit, useEditContext } from 'react-admin';
import { Typography } from '@mui/icons-material/Star';

const AsideComponent = () => {
    const { record } = useEditContext();
    return (
        <Typography>
            <i>{record.title}</i>, by {record.author} ({record.year})
        </Typography>
    );
}

const BookEdit = () => (
    <Edit aside={AsideComponent}>
        {/* ... */}
    </Edit>
);
```

You can handle this case by getting the `isPending` variable from the [`useEditContext`](./useEditContext.md) hook:

```jsx
const AsideComponent = () => {
    const { record, isPending } = useEditContext();
    if (isPending) return null;
    return (
        <Typography>
            <i>{record.title}</i>, by {record.author} ({record.year})
        </Typography>
    );
}
```

The `<Edit emptyWhileLoading>` prop provides a convenient shortcut for that use case. When enabled, `<Edit>` won't render its `aside`, `actions` and `title` components until `record` is defined.

```diff
const BookEdit = () => (
-   <Edit aside={AsideComponent}>
+   <Edit aside={AsideComponent} emptyWhileLoading>
        {/* ... */}
    </Edit>
);
```

## `id`

Components based on `<Edit>` are often used as `<Resource edit>` props, and therefore rendered when the URL matches `/[resource]/[id]`. The `<Edit>` component generates a call to `dataProvider.update()` using the id from the URL by default.

You can decide to use a `<Edit>` component in another path, or embedded in a page editing a related record (e.g. in a Dialog). In that case, you can explicitly set the `id` value:

```jsx
const PostEdit = () => (
    <Edit id={1234}>
        ...
    </Edit>
);
```

## `mutationMode`

The `<Edit>` view exposes two buttons, Save and Delete, which perform "mutations" (i.e. they alter the data). React-admin offers three modes for mutations. The mode determines when the side effects (redirection, notifications, etc.) are executed:

* `pessimistic`: The mutation is passed to the dataProvider first. When the dataProvider returns successfully, the mutation is applied locally, and the side effects are executed.
* `optimistic`: The mutation is applied locally and the side effects are executed immediately. Then the mutation is passed to the dataProvider. If the dataProvider returns successfully, nothing happens (as the mutation was already applied locally). If the dataProvider returns in error, the page is refreshed and an error notification is shown.
* `undoable` (default): The mutation is applied locally and the side effects are executed immediately. Then a notification is shown with an undo button. If the user clicks on undo, the mutation is never sent to the dataProvider, and the page is refreshed. Otherwise, after a 5 seconds delay, the mutation is passed to the dataProvider. If the dataProvider returns successfully, nothing happens (as the mutation was already applied locally). If the dataProvider returns in error, the page is refreshed and an error notification is shown.

By default, pages using `<Edit>` use the `undoable` mutation mode. This is part of the "optimistic rendering" strategy of react-admin ; it makes user interactions more reactive.

You can change this default by setting the `mutationMode` prop - and this affects both the Save and Delete buttons. For instance, to remove the ability to undo the changes, use the `optimistic` mode:

```jsx
const PostEdit = () => (
    <Edit mutationMode="optimistic">
        // ...
    </Edit>
);
```

And to make both the Save and Delete actions blocking, and wait for the dataProvider response to continue, use the `pessimistic` mode:

```jsx
const PostEdit = () => (
    <Edit mutationMode="pessimistic">
        // ...
    </Edit>
);
```

**Tip**: When using any other mode than `undoable`, the `<DeleteButton>` displays a confirmation dialog before calling the dataProvider.

**Tip**: If you want a [confirmation dialog](./Confirm.md) for the Delete button but don't mind undoable Edits, then pass a [custom toolbar](./SimpleForm.md#toolbar) to the form, as follows:

{% raw %}

```jsx
import * as React from "react";
import {
    Toolbar,
    SaveButton,
    DeleteButton,
    Edit,
    SimpleForm,
} from 'react-admin';

const CustomToolbar = () => (
    <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <SaveButton />
        <DeleteButton mutationMode="pessimistic" />
    </Toolbar>
);

const PostEdit = () => (
    <Edit>
        <SimpleForm toolbar={<CustomToolbar />}>
            ...
        </SimpleForm>
    </Edit>
);
```

{% endraw %}

## `mutationOptions`

`<Edit>` calls `dataProvider.update()` via react-query's `useMutation` hook. You can customize the options you pass to this hook, e.g. to pass [a custom `meta`](./Actions.md#meta-parameter) to the `dataProvider.update()` call.

{% raw %}

```jsx
import { Edit, SimpleForm } from 'react-admin';

const PostEdit = () => (
    <Edit mutationOptions={{ meta: { foo: 'bar' } }}>
        <SimpleForm>
            ...
        </SimpleForm>
    </Edit>
);
```

{% endraw %}

You can also use `mutationOptions` to override success or error side effects, by setting the `mutationOptions` prop. Refer to the [useMutation documentation](https://tanstack.com/query/v5/docs/react/reference/useMutation) in the react-query website for a list of the possible options.

Let's see an example with the success side effect. By default, when the save action succeeds, react-admin shows a notification, and redirects to the list page. You can override this behavior and pass custom success side effects by providing a `mutationOptions` prop with an `onSuccess` key:

{% raw %}

```jsx
import * as React from 'react';
import { useNotify, useRefresh, useRedirect, Edit, SimpleForm } from 'react-admin';

const PostEdit = () => {
    const notify = useNotify();
    const refresh = useRefresh();
    const redirect = useRedirect();

    const onSuccess = () => {
        notify(`Changes saved`);
        redirect('/posts');
        refresh();
    };

    return (
        <Edit mutationOptions={{ onSuccess }}>
            <SimpleForm>
                ...
            </SimpleForm>
        </Edit>
    );
}
```

{% endraw %}

The default `onSuccess` function is:

```js
() => {
    notify('ra.notification.updated', {
        messageArgs: { smart_count: 1 },
        undoable: mutationMode === 'undoable'
    });
    redirect('list', resource, data.id, data);
}
```

**Tip**: If you just want to customize the redirect behavior, you can use [the `redirect` prop](#redirect) instead.

**Tip**: When you use `mutationMode="pessimistic"`, the `onSuccess` function receives the response from the `dataProvider.update()` call, which is the created/edited record (see [the dataProvider documentation for details](./DataProviderWriting.md#update)). You can use that response in the success side effects:

{% raw %}

```jsx
import * as React from 'react';
import { useNotify, useRefresh, useRedirect, Edit, SimpleForm } from 'react-admin';

const PostEdit = () => {
    const notify = useNotify();
    const refresh = useRefresh();
    const redirect = useRedirect();

  const onSuccess = (data) => {
        notify(`Changes to post "${data.title}" saved`);
        redirect('/posts');
        refresh();
    };

    return (
        <Edit mutationOptions={{ onSuccess }} mutationMode="pessimistic">
            <SimpleForm>
                ...
            </SimpleForm>
        </Edit>
    );
}
```

{% endraw %}

**Tip**: If you want to have different success side effects based on the button clicked by the user (e.g. if the creation form displays two submit buttons, one to "save and redirect to the list", and another to "save and display an empty form"), you can set the `mutationOptions` prop on [the `<SaveButton>` component](./SaveButton.md), too.

Similarly, you can override the failure side effects with an `onError` option. By default, when the save action fails at the dataProvider level, react-admin shows a notification error.

{% raw %}

```jsx
import * as React from 'react';
import { useNotify, useRefresh, useRedirect, Edit, SimpleForm } from 'react-admin';

const PostEdit = () => {
    const notify = useNotify();
    const refresh = useRefresh();
    const redirect = useRedirect();

    const onError = (error) => {
        notify(`Could not edit post: ${error.message}`);
        redirect('/posts');
        refresh();
    };

    return (
        <Edit mutationOptions={{ onError }}>
            <SimpleForm>
                ...
            </SimpleForm>
        </Edit>
    );
}
```

{% endraw %}

The `onError` function receives the error from the `dataProvider.update()` call. It is a JavaScript Error object (see [the dataProvider documentation for details](./DataProviderWriting.md#error-format)).

The default `onError` function is:

```jsx
(error) => {
    notify(typeof error === 'string' ? error : error.message || 'ra.notification.http_error', { type: 'error' });
    if (mutationMode === 'undoable' || mutationMode === 'pessimistic') {
        refresh();
    }
}
```

**Tip**: If you want to have different failure side effects based on the button clicked by the user, you can set the `mutationOptions` prop on the `<SaveButton>` component, too.

## `queryOptions`

`<Edit>` calls `dataProvider.getOne()` on mount via react-query's `useQuery` hook. You can customize the options you pass to this hook by setting the `queryOptions` prop.

This can be useful e.g. to pass [a custom `meta`](./Actions.md#meta-parameter) to the `dataProvider.getOne()` call.

{% raw %}

```jsx
import { Edit, SimpleForm } from 'react-admin';

export const PostShow = () => (
    <Edit queryOptions={{ meta: { foo: 'bar' } }}>
        <SimpleForm>
            ...
        </SimpleForm>
    </Edit>
);
```

{% endraw %}

You can also use `queryOptions` to force a refetch on reconnect:

{% raw %}

```jsx
const PostEdit = () => (
    <Edit queryOptions={{ refetchOnReconnect: true }}>
        ...
    </Edit>
);
```

{% endraw %}

Refer to the [useQuery documentation](https://tanstack.com/query/v5/docs/react/reference/useQuery) in the react-query website for a list of the possible options.

## `redirect`

By default, submitting the form in the `<Edit>` view redirects to the `<List>` view.

You can customize the redirection by setting the `redirect` prop to one of the following values:

* `'list'`: redirect to the List view (the default)
* `'show'`: redirect to the Show view
* `false`: do not redirect
* A function `(resource, id, data) => string` to redirect to different targets depending on the record

```jsx
const PostEdit = () => (
    <Edit redirect="show">
        ...
    </Edit>
);
```

Note that the `redirect` prop is ignored if you set [the `mutationOptions` prop](#mutationoptions). See that prop for how to set a different redirection path in that case.

## `render`

Alternatively to `children`, you can use a `render` prop. It will receive the [`EditContext`](./useEditContext.md#return-value) as its argument, and should return a React node.

This allows to inline the render logic for the edition page.

{% raw %}

```tsx
export const PostEdit = () => (
    <Edit
        render={({ isPending, record, save, saving }) => (
            <div>
                <h1>Edit Post</h1>
                {!isPending && (
                    <form onSubmit={save}>
                        <input type="text" name="title" defaultValue={record.title} required />
                        <textarea name="teaser" defaultValue={record.teaser} rows={3} />
                        <textarea name="body" defaultValue={record.body} rows={5} />
                        <input type="date" name="published_at" defaultValue={redord.published_at} />
                        <button type="submit" disabled={saving}>
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </form>
                )}
            </div>
        )}
    />
);
```

{% endraw %}

**Tip**: When receiving a `render` prop, the `<Edit>` component will ignore the `children` prop.

## `resource`

Components based on `<Edit>` are often used as `<Resource edit>` props, and therefore rendered when the URL matches `/[resource]/[id]`. The `<Edit>` component generates a call to `dataProvider.update()` using the resource name from the URL by default.

You can decide to use a `<Edit>` component in another path, or embedded in a page using another resource name (e.g. in a Dialog). In that case, you can explicitly set the `resource` name:

```jsx
const PostEdit = () => (
    <Edit resource="posts">
        ...
    </Edit>
);
```

## `sx`: CSS API

The `<Edit>` components accept the usual `className` prop, but you can override many class names injected to the inner components by React-admin thanks to the `sx` property (see [the `sx` documentation](./SX.md) for syntax and examples). This property accepts the following keys:

| Rule name               | Description                                                                          |
|-------------------------|--------------------------------------------------------------------------------------|
| `& .RaEdit-main`      | Applied to the main container                                                        |
| `& .RaEdit-noActions` | Applied to the main container when `actions` prop is `false`                         |
| `& .RaEdit-card`      | Applied to the child component inside the main container (Material UI's `Card` by default)   |

To override the style of all instances of `<Edit>` components using the [application-wide style overrides](./AppTheme.md#theming-individual-components), use the `RaEdit` key.

## `title`

By default, the title for the Edit view is the translation key `ra.page.edit` that translates to “Edit [resource_name] [record representation]”. Check the [`<Resource recordRepresentation>`](./Resource.md#recordrepresentation) prop for more details.

You can customize this title by providing a resource specific translation with the key `resources.RESOURCE.page.edit` (e.g. `resources.posts.page.edit`):

```js
// in src/i18n/en.js
import englishMessages from 'ra-language-english';

export const en = {
    ...englishMessages,
    resources: {
        posts: {
            name: 'Post |||| Posts',
            page: {
                edit: 'Update post "%{recordRepresentation}"'
            }
        },
    },
    ...
};
```

You can also customize this title by specifying a custom `title` string:

```jsx
export const PostEdit = () => (
    <Edit title="Edit post">
        ...
    </Edit>
);
```

More interestingly, you can pass an element as `title`. This element can access the current record via `useRecordContext`. This allows to customize the title according to the current record:

```jsx
const PostTitle = () => {
    const record = useRecordContext();
    return <span>Post {record ? `"${record.title}"` : ''}</span>;
};

export const PostEdit = () => (
    <Edit title={<PostTitle />}>
        ...
    </Edit>
);
```

Finally, you can also pass `false` to disable the title:

```jsx
export const PostEdit = () => (
    <Edit title={false}>
        ...
    </Edit>
);
```

## `transform`

To transform a record after the user has submitted the form but before the record is passed to `dataProvider.update()`, use the `transform` prop. It expects a function taking a record as argument, and returning a modified record. For instance, to add a computed field upon edition:

```jsx
export const UserEdit = () => {
    const transform = data => ({
        ...data,
        fullName: `${data.firstName} ${data.lastName}`
    });
    return (
        <Edit transform={transform}>
            ...
        </Edit>
    );
}
```

The `transform` function can also return a `Promise`, which allows you to do all sorts of asynchronous calls (e.g. to the `dataProvider`) during the transformation.

**Tip**: If you want to have different transformations based on the button clicked by the user (e.g. if the creation form displays two submit buttons, one to "save", and another to "save and notify other admins"), you can set the `transform` prop on [the `<SaveButton>` component](./SaveButton.md), too.

**Tip**: The `transform` function also get the `previousData` in its second argument:

```jsx
export const UserEdit = () => {
    const transform = (data, { previousData }) => ({
        ...data,
        avoidChangeField: previousData.avoidChangeField
    });
    return (
        <Edit transform={transform}>
            ...
        </Edit>
    );
}
```

## Scaffolding An Edit Page

You can use [`<EditGuesser>`](./EditGuesser.md) to quickly bootstrap an Edit view on top of an existing API, without adding the inputs one by one.

```tsx
// in src/App.js
import * as React from "react";
import { Admin, Resource, EditGuesser } from 'react-admin';
import dataProvider from './dataProvider';

const App = () => (
    <Admin dataProvider={dataProvider}>
        {/* ... */}
        <Resource name="users" edit={EditGuesser} />
    </Admin>
);
```

Just like `<Edit>`, `<EditGuesser>` fetches the data. It then analyzes the response, and guesses the inputs it should use to display a basic `<SimpleForm>` with the data. It also dumps the components it has guessed in the console, so you can copy it into your own code.

![Guessed Edit](./img/guessed-edit.png)

You can learn more by reading [the `<EditGuesser>` documentation](./EditGuesser.md).

## Cleaning Up Empty Strings

As a reminder, HTML form inputs always return strings, even for numbers and booleans. So the empty value for a text input is the empty string, not `null` or `undefined`. This means that the data sent to `dataProvider.update()` will contain empty strings:

```js
{
    title: '',
    average_note: '',
    body: '',
    // etc.
}
```

If you prefer to have `null` values, or to omit the key for empty values, use [the `transform` prop](#transform) to sanitize the form data before submission:

```jsx
export const UserEdit = () => {
    const transform = (data) => {
        const sanitizedData = {};
        for (const key in data) {
            if (typeof data[key] === "string" && data[key].trim().length === 0) continue;
            sanitizedData[key] = data[key]; 
        }
        return sanitizedData;
    };
    return (
        <Edit transform={transform}>
            ...
        </Edit>
    );
}
```

As an alternative, you can clean up empty values at the input level, using [the `parse` prop](./Inputs.md#transforming-input-value-tofrom-record).

## Adding `meta` To The DataProvider Call

You can pass a custom `meta` to the `dataProvider` call, using either `queryOptions`, or `mutationOptions`:

* Use [the `queryOptions` prop](#queryoptions) to pass [a custom `meta`](./Actions.md#meta-parameter) to the `dataProvider.getOne()` call.
* Use [the `mutationOptions` prop](#mutationoptions) to pass [a custom `meta`](./Actions.md#meta-parameter) to the `dataProvider.update()` call.

{% raw %}

```jsx
import { Edit, SimpleForm } from 'react-admin';

const PostEdit = () => (
    <Edit mutationOptions={{ meta: { foo: 'bar' } }}>
        <SimpleForm>
            ...
        </SimpleForm>
    </Edit>
);
```

{% endraw %}

## Changing The Notification Message

![Edit notification](./img/EditSuccess.png)

Once the `dataProvider.update()` request returns successfully, users see a generic notification ("Element updated").

`<Edit>` uses two successive translation keys to build the success message:

* `resources.{resource}.notifications.updated` as a first choice
* `ra.notification.updated` as a fallback

To customize the notification message, you can set custom translation for these keys in your i18nProvider.

**Tip**: If you choose to use a custom translation, be aware that react-admin uses the same translation message for the `<BulkUpdateButton>`, so the message must support [pluralization](./TranslationTranslating.md#interpolation-pluralization-and-default-translation):

```jsx
const englishMessages = {
    resources: {
        comments: {
            notifications: {
                updated: 'Comment updated |||| %{smart_count} comments updated',
                // ...
            },
        },
    },
};
```

Alternately, you can customize this message by passing a custom success side effect function in [the `mutationOptions` prop](#mutationoptions):

{% raw %}

```jsx
import * as React from 'react';
import { useNotify, useRedirect, Edit, SimpleForm } from 'react-admin';

const PostEdit = () => {
    const notify = useNotify();
    const redirect = useRedirect();

    const onSuccess = () => {
        notify(`Post updated successfully`);
        redirect('list', 'posts');
    };

    return (
        <Edit mutationOptions={{ onSuccess }}>
            <SimpleForm>
                ...
            </SimpleForm>
        </Edit>
    );
}
```

{% endraw %}

**Tip**: In `optimistic` and `undoable` mutation modes, react-admin calls the `onSuccess` callback method with no argument. In `pessimistic` mode, it calls it with the response returned by the dataProvider as argument.

You can do the same for error notifications, by passing a custom `onError`  callback.

**Tip**: The notification message will be translated.

## Prefilling the Form

You sometimes need to pre-populate the form changes to a record. For instance, to revert a record to a previous version, or to make some changes while letting users modify others fields as well.

By default, the `<Edit>` view starts with the current `record`. However, if the `location` object (injected by [react-router-dom](https://reactrouter.com/6.28.0/start/concepts#locations)) contains a `record` in its `state`, the `<Edit>` view uses that `record` to prefill the form.

That means that if you want to create a link to an edition view, modifying immediately *some* values, all you have to do is to set the `state` prop of the `<EditButton>`:

{% raw %}

```jsx
import * as React from 'react';
import { EditButton, DataTable, List } from 'react-admin';

const ApproveButton = () => {
    return (
        <EditButton
            state={{ record: { status: 'approved' } }}
        />
    );
};

export default PostList = () => (
    <List>
        <DataTable>
            ...
            <DataTable.Col>
                <ApproveButton />
            </DataTable.Col>
        </DataTable>
    </List>
)
```

{% endraw %}

**Tip**: The `<Edit>` component also watches the "source" parameter of `location.search` (the query string in the URL) in addition to `location.state` (a cross-page message hidden in the router memory). So the `ApproveButton` could also be written as:

{% raw %}

```jsx
import * as React from 'react';
import { EditButton } from 'react-admin';

const ApproveButton = () => {
    return (
        <EditButton
            to={{
                search: `?source=${JSON.stringify({ status: 'approved' })}`,
            }}
        />
    );
};
```

{% endraw %}

Should you use the location `state` or the location `search`? The latter modifies the URL, so it's only necessary if you want to build cross-application links (e.g. from one admin to the other). In general, using the location `state` is a safe bet.

## Editing A Record In A Modal

`<Edit>` is designed to be a page component, passed to the `edit` prop of the `<Resource>` component. But you may want to let users edit a record from another page.

<video controls autoplay playsinline muted loop>
  <source src="https://react-admin-ee.marmelab.com/assets/edit-dialog.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

* If you want to allow edition from the `list` page, use [the `<EditDialog>` component](./EditDialog.md)
* If you want to allow edition from another page, use [the `<EditInDialogButton>` component](./EditInDialogButton.md)

## Live Updates

If you want to subscribe to live updates on the record (topic: `resource/[resource]/[id]`), use [the `<EditLive>` component](./EditLive.md) instead.

```diff
-import { Edit, SimpleForm, TextInput } from 'react-admin';
+import { SimpleForm, TextInput } from 'react-admin';
+import { EditLive } from '@react-admin/ra-realtime';

const PostEdit = () => (
-   <Edit>
+   <EditLive>
        <SimpleForm>
            <TextInput source="title" />
        </SimpleForm>
-   </Edit>
+   </EditLive>
);
```

The user will see alerts when other users update or delete the record.

## Linking Two Inputs

<iframe src="https://www.youtube-nocookie.com/embed/YkqjydtmfcU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen style="aspect-ratio: 16 / 9;width:100%;margin-bottom:1em;"></iframe>

Edition forms often contain linked inputs, e.g. country and city (the choices of the latter depending on the value of the former).

React-admin relies on [react-hook-form](https://react-hook-form.com/) for form handling. You can grab the current form values using react-hook-form's [useWatch](https://react-hook-form.com/docs/usewatch) hook.

```jsx
import * as React from 'react';
import { Edit, SimpleForm, SelectInput } from 'react-admin';
import { useWatch } from 'react-hook-form';

const countries = ['USA', 'UK', 'France'];
const cities = {
    USA: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
    UK: ['London', 'Birmingham', 'Glasgow', 'Liverpool', 'Bristol'],
    France: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice'],
};
const toChoices = items => items.map(item => ({ id: item, name: item }));

const CityInput = () => {
    const country = useWatch({ name: 'country' });
    return (
        <SelectInput
            choices={country ? toChoices(cities[country]) : []}
            source="cities"
        />
    );
};

const OrderEdit = () => (
    <Edit>
        <SimpleForm>
            <SelectInput source="country" choices={toChoices(countries)} />
            <CityInput />
        </SimpleForm>
    </Edit>
);

export default OrderEdit;
```

**Tip:** If you'd like to avoid creating an intermediate component like `<CityInput>`, or are using an `<ArrayInput>`, you can use the [`<FormDataConsumer>`](./Inputs.md#linking-two-inputs) component as an alternative.

## Navigating Through Records

[`<PrevNextButtons>`](./PrevNextButtons.md) renders a navigation with two buttons, allowing users to navigate through records without leaving an `<Edit>` view.

<video controls autoplay playsinline muted loop>
  <source src="./img/prev-next-buttons-edit.webm" type="video/webm" />
  <source src="./img/prev-next-buttons-edit.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>

The following code is an example of how you can use it:

```tsx
export const PostEdit = () => (
    <Edit
        actions={
            <TopToolbar>
                <PrevNextButtons />
            </TopToolbar>
        }
    >
    ...
    </Edit>
);
```

**Tips:** If you want users to be warned if they haven't pressed the Save button when they browse to another record, you can follow the tutorial [Navigating Through Records In`<Edit>` Views](./PrevNextButtons.md#navigating-through-records-in-edit-views-after-submit).

## Controlled Mode

`<Edit>` deduces the resource and the record id from the URL. This is fine for an edition page, but if you need to let users edit records from another page, you probably want to define the edit parameters yourself.

In that case, use the [`resource`](#resource) and [`id`](#id) props to set the edit parameters regardless of the URL.

```jsx
import { Edit, SimpleForm, TextInput, SelectInput } from "react-admin";

export const BookEdit = ({ id }) => (
    <Edit resource="books" id={id} redirect={false}>
        <SimpleForm>
            <TextInput source="title" />
            <TextInput source="author" />
            <SelectInput source="availability" choices={[
                { id: "in_stock", name: "In stock" },
                { id: "out_of_stock", name: "Out of stock" },
                { id: "out_of_print", name: "Out of print" },
            ]} />
        </SimpleForm>
    </Edit>
);
```

**Tip**: You probably also want to customize [the `redirect` prop](#redirect) if you embed an `<Edit>` component in another page.

## Headless Version

Besides fetching a record and preparing a save handler, `<Edit>` renders the default edition page layout (title, actions, a Material UI `<Card>`) and its children. If you need a custom edition layout, you may prefer [the `<EditBase>` component](./EditBase.md), which only renders its children in an [`EditContext`](./useEditContext.md).

```jsx
import { EditBase, SelectInput, SimpleForm, TextInput, Title } from "react-admin";
import { Card, CardContent, Container } from "@mui/material";

export const BookEdit = () => (
    <EditBase>
        <Container>
            <Title title="Book Edition" />
            <Card>
                <CardContent>
                    <SimpleForm>
                        <TextInput source="title" />
                        <TextInput source="author" />
                        <SelectInput source="availability" choices={[
                            { id: "in_stock", name: "In stock" },
                            { id: "out_of_stock", name: "Out of stock" },
                            { id: "out_of_print", name: "Out of print" },
                        ]} />
                    </SimpleForm>
                </CardContent>
            </Card>
        </Container>
    </EditBase>
);
```

In the previous example, `<SimpleForm>` grabs the record and the save handler from the `EditContext`.

If you don't need the `EditContext`, you can use [the `useEditController` hook](./useEditController.md), which does the same data fetching as `<EditBase>` but lets you render the content.

```tsx
import { useEditController, SelectInput, SimpleForm, TextInput, Title } from "react-admin";
import { Card, CardContent, Container } from "@mui/material";

export const BookEdit = () => {
    const { record, save } = useEditController();
    return (
        <Container>
            <Title title={`Edit book ${record?.title}`} />
            <Card>
                <CardContent>
                    <SimpleForm record={record} onSubmit={values => save(values)}>
                        <TextInput source="title" />
                        <TextInput source="author" />
                        <SelectInput source="availability" choices={[
                            { id: "in_stock", name: "In stock" },
                            { id: "out_of_stock", name: "Out of stock" },
                            { id: "out_of_print", name: "Out of print" },
                        ]} />
                    </SimpleForm>
                </CardContent>
            </Card>
        </Container>
    );
};
```

## Anonymous Access

The `<Edit>` component requires authentication and will redirect anonymous users to the login page. If you want to allow anonymous access, use the [`disableAuthentication`](#disableauthentication) prop.

```jsx
const PostEdit = () => (
    <Edit disableAuthentication>
        ...
    </Edit>
);
```

## Access Control

If your `authProvider` implements [Access Control](./Permissions.md#access-control), `<Edit>`  will only render if the user has the "edit" access to the related resource.

For instance, for the `<PostEdit>`page below:

```tsx
import { Edit, SimpleForm, TextInput } from 'react-admin';

// Resource name is "posts"
const PostEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="title" />
            <TextInput source="author" />
            <TextInput source="published_at" />
        </SimpleForm>
    </Edit>
);
```

`<Edit>` will call `authProvider.canAccess()` using the following parameters:

```jsx
{ action: "edit", resource: "posts" }
```

Users without access will be redirected to the [Access Denied page](./Admin.md#accessdenied).

**Note**: Access control is disabled when you use [the `disableAuthentication` prop](#disableauthentication).
