#!/usr/bin/env bash

rm -rf src/assets/vendors/
mkdir -p src/assets/vendors/


# Copy line awesome icon
mkdir -p src/assets/vendors/line-awesome/
cp -R node_modules/line-awesome/dist/ src/assets/vendors/line-awesome/


# Copy open sans font
mkdir -p src/assets/vendors/open-sans/
mkdir -p src/assets/vendors/open-sans/files/

cp -R node_modules/typeface-open-sans/files/ src/assets/vendors/open-sans/files/
cp node_modules/typeface-open-sans/index.css src/assets/vendors/open-sans/index.css


# Copy monaco editor
mkdir -p src/assets/vendors/monaco-editor/

cp -R node_modules/monaco-editor/min/vs/ src/assets/vendors/monaco-editor/vs/
cp node_modules/monaco-editor/monaco.d.ts src/assets/vendors/monaco-editor/monaco.d.ts


# Copy highlight style
mkdir -p src/assets/vendors/highlight/

cp node_modules/highlight.js/styles/github-gist.css src/assets/vendors/highlight/github-gist.css


# Copy devicon
mkdir -p src/assets/vendors/devicon/
cp -R node_modules/devicon-2.2/icons/ src/assets/vendors/devicon/
cp node_modules/devicon-2.2/devicon.json src/assets/vendors/devicon/devicon.json
cp node_modules/devicon-2.2/devicon.min.css src/assets/vendors/devicon/devicon.min.css
