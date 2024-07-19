---
name: Bookmarklet Submission
description: Submit your bookmarklet to the site.
title: "[SUBMISSION]: "
labels: submission-new
assignees: WebBreacher
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this submission. We will review it and get back to you via the email you provided.
  - type: input
    id: email
    attributes:
      label: Your email
      description: We will reach out to you to confirm your submission.
      placeholder: user@example.com
    validations:
      required: true
  - type: input
    id: name
    attributes:
      label: Your name
      description: Please provide your name.
      placeholder: Inigo Montoya
    validations:
      required: true
  - type: textarea
    id: bookmarklet
    attributes:
      label: Please paste your bookmarklet here.
      description: Also tell us, what did you expect to happen?
    validations:
      required: true
  - type: textarea
    id: description
    attributes:
      label: Tell us what this bookmarklet does
      description: Please copy and paste any relevant log output. This will be automatically formatted into code, so no need for backticks.
      render: shell
    validations:
      required: true
  - type: textarea
    id: urls
    attributes:
      label: Tell us examples of URLs the bookmarklet would be used on
      description: Give us some example places where your bookmarklet could be used. We will use these URLs for testing your bookmarklet out.
      render: shell
    validations:
      required: true
  - type: textarea
    id: notes
    attributes:
      label: Anything else we need to know?
      description: Please let us know if there are additional issues or restrictions with your submission. For instance, does a user need to be logged into a certain site for it to work? Have to use a certain browser? Let us know.
    validations:
      required: false
  - type: checkboxes
    id: terms
    attributes:
      label: Code of Conduct
      description: By submitting this issue, you confirm that you own/created this bookmarklet or have explicit permission from its owner for us to use it. You also agree to be emailed for the purpose of discussing this work. We will contact you before publishing the bookmarklet and, you understand that, while we appreciate your submission, there may be reasons why we do not use it.
      options:
        - label: I agree to these statements.
          required: true
---