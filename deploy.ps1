cd  .\src\dashboard
rd -r dist
npm run build
Compress-Archive -Path ./dist/* -DestinationPath ./dist/dashboard.zip
cd ..\..

cd .\infrastructure
pulumi up