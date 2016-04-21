OneAPM Performance Test-suit
===================

测试说明
-------------
测试使用Express.JS构建了一个简单的Web接口，模拟一个请求用户资料的场景：

```
Client --->Server:请求数据（参数：user_id，token） 
                  Server: 1. 到redis中验证用户的token
                  Server: 2. 到mongodb中获取用户基本资料和好友id
                  Server: 3. 在mongodb中获取每个好友的基本信息
Client <--- Server: 返回用户个人资料和好友基本信息
```

准备工作
------

 - 环境中保证安装redis和mongodb，使用默认的链接设置
  - 安装Node.JS依赖 `npm install`
   - 编辑`oneapm.js`，填写测使用的license_key
   - 执行`node prepare.js`，该命令会向redis写入一条记录，在mongodb中创建一个名为`oneapm`的数据库，用于测试

   运行Server
   ------
   - `node bin/www`，不启动OneAPM
   - `ENABLE_ONEAPM=1 node bin/www`，启动OneAPM

   执行测试
   -----
   `node tester`
   完成一次测试（1000个http请求）需要7~15秒左右的时间，根据机器配置不同有所变化


   测试结果
   ------
   开启/关闭OneAPM的情况下，每次连续测试3次。
   测试机器的配置为：
   - CPU: Intel(R) Core(TM) i5-4460  CPU @ 3.20GHz，四核
   - Memory: DDR3 1600MHz, 16G
   - OS: Arch Linux 64bit, Kernel 4.5.1-1


   | 测试结果          | 关闭OneAPM  | 开启OneAPM |
    ----------------- | -----------| ----------|
    | 第1次执行测试      |  6.762 ms  |  7.683 ms |
    | 第2次执行测试      |  8.921 ms  | 10.070 ms |
    | 第3次执行测试      | 11.239 ms  | 11.897 ms |

    连续测试中，前一次测试会产生一定数量的`TIME_WAIT`状态的socket，对后继测试产生一定影响，所以三次的时间会持续加长。执行完三次连续测时，会等待socket状态回复正常，再继续测试。需要注意的是，开启探针后，每次与关闭探针对应的测试差距都在1 ms左右，并不是线性的增长。因此在复杂业务逻辑中，探针占用的时间比例会进一步降低。

    测试程序仅模拟一个基本的使用情况来作为参考，具体性能表现还与服务的业务逻辑复杂程度有关。
