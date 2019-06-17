cd  .\src\dashboard
rd -r dist
npm i
npm run build
cd ..\..

cd .\infrastructure
npm i
pulumi up
cd ..