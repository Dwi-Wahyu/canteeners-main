# CANTEENERS 2025

docker build -t canteeners-main .

docker run -d \
 --name canteeners-prod \
 -p 3000:3000 \
 --restart always \
 canteeners-app
