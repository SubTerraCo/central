# @central/integration-adapter

Shared TypeScript interface for **Central integration** modules.

Central owns the Local API client, credentials, first-pull, and later tag/view writes. This package exists so **Hermes** can plug into Central the same way as Grok bot Anytype (`AT`): implement `IntegrationAdapter` (`id`, `displayName`, `deweyCode`, `health`, `firstPull`, stub writes) without becoming a Cara Node service or a marketplace package.

Classification is `integration` only.
