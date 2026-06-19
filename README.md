# NeoStation Official Website

This repository contains the source code for the official NeoStation landing page, accessible at [neostation.dev](https://neostation.dev).

## Technology Stack

- **Framework:** [Astro](https://astro.build/)
- **Styling:** Tailwind CSS
- **Deployment:** Automated via Dokploy
- **Infrastructure:** Private VPS

## Project Structure

This is a standard Astro project. The main content and components can be found in the `/src` directory. Static assets such as images and fonts are located in the `/public` directory.

## Development

To run the project locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

## Deployment Workflow

The deployment is fully automated. Any push or merge to the `main` branch triggers a deployment via Dokploy to our production VPS.

Please ensure all changes are tested locally before merging into the main branch to avoid downtime on the live site.

## Contributions

We welcome community contributions to improve the website's content, performance, or design.

1. Fork the repository.
2. Create a feature branch.
3. Submit a Pull Request with a detailed description of your changes.

For significant design changes, please open an Issue first to discuss your ideas with the team.

## Licensing

- **This website (source code):** [MIT License](./LICENSE.md)
- **NeoStation application (Flutter frontend):** [GPL v3](https://github.com/mmisobadev/neostation-frontend/blob/main/LICENSE.md)
- **Branding and Design:** The visual identity, logos, and copywriting are protected assets of the NeoStation project.
