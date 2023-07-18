---
layout: default
---

# Components

This page contains a list of all the client components in the project and their purpose, used to help with development and debugging.
This also serves as a reference to the functionality of the components, and can be used as a usability test plan.


### [LoadingSpinner.tsx](https://github.com/416rehman/contractrPro/tree/dev/client/components/LoadingSpinner.tsx)

The default loading spinner used throughout the application and is used as the main loading indicator for pages.<br/>
This is a simple wrapper around the NextUI Spinner component and is kept minimal for ease of use.<br/>


### [authFallback.tsx](https://github.com/416rehman/contractrPro/tree/dev/client/components/authFallback.tsx)

Renders content, but if the fallbackIf condition is met, renders the fallback instead.<br/>
This is used for authentication/authorization purposes such as redirecting to the login page if the user is not logged in.<br/>
The server-side version of this component is AuthSwitchServer.<br/>


### [authRedirect.tsx](https://github.com/416rehman/contractrPro/tree/dev/client/components/authRedirect.tsx)

Redirects the signedInUser to a page if they are logged in or logged out.<br/>
Functions similarly to AuthFallback, but redirects instead of rendering a fallback.<br/>
@example `<AuthRedirectServer to={"/"} if={"logged-in"}>...</AuthRedirectServer>` Redirects to `/` if logged in, otherwise renders children<br/>
@example `<AuthRedirectServer to={"/"} if={"logged-out"}>...</AuthRedirectServer>` Redirects to `/` if logged out, otherwise renders children<br/>


### [clientForm.tsx](https://github.com/416rehman/contractrPro/tree/dev/client/components/clientForm.tsx)

This is the main form for editing and or creating a client. The form receives the client id as a prop.<br/>
If the client id is undefined, the form will be in create mode. Otherwise, it will be in edit mode.<br/>
It handles communication with the API and updates the local state via the Client service.<br/>


### [clientsSidebar.tsx](https://github.com/416rehman/contractrPro/tree/dev/client/components/clientsSidebar.tsx)

**Work In Progress**: This component is not yet complete.

This is the sidebar for the clients page. It displays a list of clients and should allow the user to filter them.<br/>
It handles communication with the API and updates the local state via the Client service.<br/>
This is used in tandem with the ClientForm component to edit/create clients.<br/>
TODO: Implement filtering<br/>


### [createOrganizationModal.tsx](https://github.com/416rehman/contractrPro/tree/dev/client/components/createOrganizationModal.tsx)

**Work In Progress**: This component is not yet complete.

This is the modal for creating an organization. This is a controlled component and can be opened and closed via the isOpen prop.<br/>
Right now only the form is implemented. The actual API call to create an organization is not implemented yet.<br/>
TODO: Create the Organization service to handle CRUD operations for organizations.<br/>


### [homeCTA.tsx](https://github.com/416rehman/contractrPro/tree/dev/client/components/homeCTA.tsx)

This is the main call to action on the home page. It contains a title, subtitle, and a signup form.<br/>
This is usually the first thing a user sees when they visit the site, if they are not logged in.<br/>
It is also used as the fallback for the home page if the user is not logged in.<br/>


### [jobForm.tsx](https://github.com/416rehman/contractrPro/tree/dev/client/components/jobForm.tsx)

**Work In Progress**: This component is not yet complete.

This is the main form for editing and or creating a job. The form receives the job id as a prop.<br/>
If the job id is undefined, the form will be in create mode. Otherwise, it will be in edit mode.<br/>
It handles communication with the API and updates the local state via the Job service.<br/>
TODO: Implement this component and the Job service.<br/>


### [jobsNavbar.tsx](https://github.com/416rehman/contractrPro/tree/dev/client/components/jobsNavbar.tsx)

**Work In Progress**: This component is not yet complete.

This is the main form for editing and or creating a job. The form receives the job id as a prop.<br/>
If the job id is undefined, the form will be in create mode. Otherwise, it will be in edit mode.<br/>
It handles communication with the API and updates the local state via the Job service.<br/>
TODO: Implement this component and the Job service.<br/>


### [joinOrganizationModal.tsx](https://github.com/416rehman/contractrPro/tree/dev/client/components/joinOrganizationModal.tsx)

**Work In Progress**: This component is not yet complete.

This is the modal for joining an organization. This is a controlled component and can be opened and closed via the isOpen prop.<br/>
Right now only the form is implemented. The actual API call to join an organization is not implemented yet.<br/>
The user should be able to join an organization via a join code or a link which will be provided by the organization.<br/>
TODO: Create the Organization service to handle CRUD operations for organizations.<br/>


### [loginForm.tsx](https://github.com/416rehman/contractrPro/tree/dev/client/components/loginForm.tsx)

This is the login form component. It is used to login to the application.<br/>
It shows a form with a username and password field. Though the user can login with either their username or email.<br/>
It also has links to the signup page and the forgot password page.<br/>


### [organizationSelector.tsx](https://github.com/416rehman/contractrPro/tree/dev/client/components/organizationSelector.tsx)

The organization selector is the main component for selecting an organization. It is used in the header and in any pages that require an organization to be selected.<br/>
ContractrPro is a multi-tenant application, so the organization is a key part of the application and most of the operations are scoped to an organization.<br/>
This component is a dropdown that lists the organizations the user is a member of. It also has actions for creating and joining organizations.<br/>
Upon selecting an organization, the `currentOrganization` state is updated in the user store. The `create organization` and `join organization` actions open their respective modals.<br/>
For more, see the **`JoinOrganizationModal`** and **`CreateOrganizationModal`** components.<br/>


### [sidebar.tsx](https://github.com/416rehman/contractrPro/tree/dev/client/components/sidebar.tsx)

This is the main sidebar for the application. It displays a list of links to the main pages of the application.<br/>
- It requires the user to be logged in.<br/>
- The sidebar is collapsible<br/>
- It displays a tooltip on hover for each item<br/>
- It highlights the current page<br/>
- It becomes a top bar on mobile (merged with TopBar)<br/>


### [signupForm.tsx](https://github.com/416rehman/contractrPro/tree/dev/client/components/signupForm.tsx)

The default signup form component. It is used to create a new account.<br/>
- Shows a form with a username, email and password field.<br/>
- It also has a link to the login page.<br/>
- On submit, the button is disabled until the request is completed.<br/>
- On success, the user is redirected to the login page.<br/>
- On error, the error is shown in a toast.<br/>


### [theme-switch.tsx](https://github.com/416rehman/contractrPro/tree/dev/client/components/theme-switch.tsx)

A switch to toggle between light and dark mode. It uses the next-themes package.<br/>
- is icon only<br/>
- shows a tooltip on hover<br/>
- changes the theme on click<br/>
- displays different icons depending on the current theme<br/>


### [toast.tsx](https://github.com/416rehman/contractrPro/tree/dev/client/components/toast.tsx)

A toast component that shows a message for a few seconds. It can be used to show a success, error, warning or info message.<br/>
It is used in tandem with the **ToastBox** component which occupies the bottom right corner of the screen and shows all the toasts.<br/>
The Toasts service can be used to add toasts from anywhere in the app.<br/>
- The **title** is shown in bold at the top of the toast.<br/>
- The **message** is shown below the title.<br/>
- The **type** determines the color of the toast. It can be "info", "success", "error" or "warning".<br/>
- The **durationInSecs** determines how long the toast is shown. It is 5 seconds by default.<br/>
- The **body** can be any ReactNode. It is shown below the message.<br/>
- The **showDuration** determines whether the duration progress bar is shown. It is true by default.<br/>
- The **hideCloseButton** determines whether the close button is shown. It is false by default.<br/>
- The **onClose** is called when the toast is closed.<br/>
- The **isPressable** determines whether the toast is pressable. It is false by default.<br/>
- The **onPress** is called when the toast is pressed.<br/>
- The **endContent** is shown at the end (right side) of the toast.<br/>
- The **startContent** is shown at the start (left side) of the toast.<br/>


### [toastBox.tsx](https://github.com/416rehman/contractrPro/tree/dev/client/components/toastBox.tsx)

The toast box component. It is used to contain all the toasts.<br/>
- is a container for all the toasts.<br/>
- displayed on top of all other components.<br/>
- occupies the bottom right corner of the screen.<br/>


### [topbar.tsx](https://github.com/416rehman/contractrPro/tree/dev/client/components/topbar.tsx)

The main navigation component of the app. It is shown at the top of the screen.<br/>
- Always visible.<br/>
- If no user is logged in, it shows the visitor menu.<br/>
- If a user is logged in, it shows the user menu, a search bar, and the organization selector.<br/>
- In mobile, it shows a hamburger menu that shows its content in a vertical navbar.<br/>
- In mobile, it also shows the sidebar items in a vertical navbar.<br/>


### [userMenu.tsx](https://github.com/416rehman/contractrPro/tree/dev/client/components/userMenu.tsx)

This is the user menu component. It is used to show the user menu in the top right corner of the screen.<br/>
- shows the user's unique username and email.<br/>
- also shows the user's profile picture.<br/>
- has a dropdown menu with options to logout, go to settings, etc.<br/>
- In mobile view, it only shows the user's avatar.<br/>
- In mobile view, it shows the user's username and email in the dropdown menu.<br/>


### [visitorMenu.tsx](https://github.com/416rehman/contractrPro/tree/dev/client/components/visitorMenu.tsx)

The menu for visitors (not logged-in users). Contains the login and signup buttons.<br/>
- is a dropdown on small screens<br/>
- is a navbar on large screens<br/>
- contains a theme switch<br/>
- contains a link to the login page<br/>
- contains a link to the signup page<br/>


