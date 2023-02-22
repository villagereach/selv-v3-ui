if [ $PRODUCTION == true ]; then
  echo "building image for production instance"
  cp ./credentials/production_env/settings.env .env
else
  echo "building image for dev/test instance"
  cp ./credentials/test_env/settings.env .env
fi

echo "" >> .env && cat ./credentials/shared/versions.env >> .env

echo "version of dev-ui module is"
printenv OL_DEV_UI_VERSION
echo "start pulling"

/usr/local/bin/docker-compose pull
/usr/local/bin/docker-compose down --volumes
/usr/local/bin/docker-compose run --entrypoint ./build.sh selv-v3-ui
/usr/local/bin/docker-compose build image
/usr/local/bin/docker-compose down --volumes

docker login -u="$DOCKER_USERNAME" -p="$DOCKER_PASSWORD"

if [ $PRODUCTION == true ]; then
  echo "pushing image for production instance"
  docker tag openlmismz/selv-v3-ui:latest openlmismz/selv-v3-production-ui:${version}
  docker push openlmismz/selv-v3-production-ui:${version}
else
  echo "pushing image for dev/test instance"
  docker tag openlmismz/selv-v3-ui:latest openlmismz/selv-v3-ui:${version}
  docker push openlmismz/selv-v3-ui:${version}
fi

rm -Rf ./credentials
rm -f .env