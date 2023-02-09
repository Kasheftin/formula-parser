#!/bin/bash
echo "Vue Build Started"
cd vue
npm i
npm run build
echo "Vue Build Completed"
cd ..
echo "React Build Started"
cd react
npm i
npm run build
echo "React Build Completed"
