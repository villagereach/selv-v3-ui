# if [ $PRODUCTION == true ]; then
#   echo "building image for production instance"
#   cp ./credentials/production_env/settings.env .env
# else
#   echo "building image for dev/test instance"
#   cp ./credentials/test_env/settings.env .env
# fi

# /usr/local/bin/docker-compose pull
# /usr/local/bin/docker-compose down --volumes
# /usr/local/bin/docker-compose run --entrypoint ./build.sh angola-ui
# /usr/local/bin/docker-compose build image
# /usr/local/bin/docker-compose down --volumes

# if [ $PRODUCTION == true ]; then
#   echo "pushing image for production instance"
#   docker tag openlmisao/angola-ui:latest openlmisao/angola-production-ui:${version}
#   docker push openlmisao/angola-production-ui:${version}
# else
#   echo "pushing image for dev/test instance"
#   docker tag openlmisao/angola-ui:latest openlmisao/angola-ui:${version}
#   docker push openlmisao/angola-ui:${version}
# fi

# rm -Rf ./credentials
# rm -f .env