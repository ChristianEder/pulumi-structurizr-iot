cd  .\src\dashboard
rd -r dist
npm run build
cd ..\..

cd .\infrastructure
pulumi up
cd ..