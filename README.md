## 启动

``` shell
npm install
#开发
npm run dev
#部署
npm run prod
```
## 停止
``` shell
#部署环境下
#找到进程
pm2 list
#停止
pm2 delete <id|name>
```

## 复制库
db.copyDatabase('myServiceV2','myServiceV2','47.98.140.76:27017')
