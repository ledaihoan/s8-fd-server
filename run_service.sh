#!/usr/bin/env bash
APP_PROF=production
if [ "x$1" != "x" ]; then
  APP_PROF=$1
fi
GIT_BRANCH=main
if [ "x$2" != "x" ]; then
  GIT_BRANCH=$2
fi
echo "Step1/3 Git update $GIT_BRANCH->$APP_PROF..."
git reset --hard HEAD
git checkout $GIT_BRANCH
git reset --hard HEAD
git pull
if [ "$3" == "cleanbuild" ]; then
  echo ">>>Performing clean build..."
  rm -rf node_modules
fi
echo "Step2/3 >>> re-building source..."
yarn
yarn build
echo "Step3/3 >>> running app..."
export NODE_ENV=$APP_PROF
. init_env.sh $APP_PROF
pm2 startOrReload ecosystem.config.js
echo "Done!"
