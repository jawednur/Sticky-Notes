# Sticky Notes App

A digital sticky notes application built with React, TypeScript, and Tailwind CSS. Organize your thoughts across different project boards with drag-and-drop functionality.

## Features

- **Multiple Boards**: Create and manage different boards for various projects
- **Drag and Drop**: Move sticky notes between different positions
- **Customizable Colors**: Choose from various colors for your notes
- **Edit in Place**: Click notes to expand and edit them
- **Responsive Design**: Works well on different screen sizes

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Application

To start the development server:

```bash
npm run dev
```

The application will open at `http://localhost:5173` (or another port if 5173 is busy).

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

To preview the production build:

```bash
npm run preview
```

## Usage

1. **Creating Boards**: Click the "New Board" button to create a new project board
2. **Adding Notes**: Click the "+" button in the top-right corner of a board to add a new note
3. **Editing Notes**: Click on a note to expand it, then click the edit icon
4. **Moving Notes**: Drag and drop notes to reposition them
5. **Deleting Notes**: Expand a note and click the trash icon
6. **Switching Boards**: Click on board tabs to switch between different boards

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (for icons)

## Deployment

The app is deployed to GitHub Pages at: https://jawednur.github.io/Sticky-Notes/

### Automatic Deployment

The app is automatically deployed to GitHub Pages when changes are pushed to the `main` branch using GitHub Actions.

### Manual Deployment

You can also deploy manually using:

```bash
npm run deploy
```

This will build the app and push it to the `gh-pages` branch. 