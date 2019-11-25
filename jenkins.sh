if [ $PRODUCTION == true ]; then
  echo "building image for production instance"
  cp ./credentials/production_env/settings.env .env
else
  echo "building image for dev/test instance"
  cp ./credentials/test_env/settings.env .env
fi

/usr/local/bin/docker-compose pull
/usr/local/bin/docker-compose down --volumes
/usr/local/bin/docker-compose run --entrypoint ./build.sh selv-v3-ui
/usr/local/bin/docker-compose build image
/usr/local/bin/docker-compose down --volumes

if [ $PRODUCTION == true ]; then
  echo "pushing image for production instance"
  docker tag openlmisselv/selv-v3-ui:latest openlmisselv/selv-v3-production-ui:${version}
  docker push openlmisselv/selv-v3-production-ui:${version}
else
  echo "pushing image for dev/test instance"
  docker tag openlmisselv/selv-v3-ui:latest openlmisselv/selv-v3-ui:${version}
  docker push openlmisselv/selv-v3-ui:${version}
fi

rm -Rf ./credentials
rm -f .env