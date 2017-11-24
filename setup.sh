#run this (once) to setup the front-end

mvn package
cd React_Full_Project
npm uninstall webpack-dev-server
npm install -D webpack-dev-server@2.7.1
npm install
npm run build
