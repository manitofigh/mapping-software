# Contributing
Contributions are accepted in the form of pull requests. Please follow the guidelines below on how to manage your branches and commits.

## Commit Messages:
```
<commit-message> ::= [<type>[ "#"<number>]: ]<short-description>["\n\n"<long-description>]

<type> ::= "fix" | "fixes"
         | "feat"
         | "bugfix"
         | "revert"
         | "cleanup"
         | "doc"
```

https://www.conventionalcommits.org/

The first line of a commit message is to provide a short summary that really should not be longer than 50 characters and must not exceed 72 characters. GitHub and GitLab will truncate any commit message longer than around 50 to 70 characters, depending on the page or context.

Justification: https://stackoverflow.com/q/2290016

## Feature Branch Naming Convention:

```
<branch-name> ::= <name>-<type>-[<number>-]<description>
                | <name>-[<number>-]<type>-<description>

<type> ::= "bug"               # for bugfixes, typically to fix a crash or logic error
         | "fix"               # for other fixes, such as enhancements and minor corrections
         | "feat" | "ft"       # new features
         | "ui"                # for UI fixes and enhancements
         | "doc"               # for comments and documentation-related commits
         | "cleanup" | "maint" # for refactoring, removing dead code, fixing whitespace, or other code quality enhancements

<name> ::= <nickname> | <initials>
<nickname> ::= <short-firstname> | "yourFirstName" | "etc"
<initials> ::= "fn" | etc.
```

## Examples:

For bug fixes:
`name-bug-9-admin-aprv`

For features:
`name-feat-51-dash-proj`

For comments (document related):
`name-doc-user-reg`

For code cleanup:
`name-page-30-some-funcs`

For UI/UX changes:
`name-ui-43-landing-page`

For anything else:
`name-dev-temp`

