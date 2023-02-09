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

cd ..

mkdir dist
mv vue/dist dist
mv dist/dist dist/vue
mv react/dist/react-vite dist
mv dist/react-vite dist/react
rmdir react/dist

git checkout --orphan gh-pages
git --work-tree dist add --all
git --work-tree dist commit -m gh-pages
git push origin HEAD:gh-pages --force

rm -rf dist
git checkout -f master
git branch -D gh-pages
