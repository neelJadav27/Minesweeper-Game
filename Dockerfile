FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY Minesweeper/index.html .
COPY Minesweeper/css/ css/
COPY Minesweeper/images/ images/
COPY Minesweeper/js/ js/


EXPOSE 80

CMD ["nginx","-g", "daemon off;"]