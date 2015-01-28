-- MySQL dump 10.13  Distrib 5.5.40, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: blog
-- ------------------------------------------------------
-- Server version	5.5.40-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `account` varchar(12) NOT NULL DEFAULT '',
  `password` varchar(32) DEFAULT NULL,
  `Email` varchar(25) DEFAULT NULL,
  `Admin` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`account`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('907987244','6bef68407afc93ec8d800edaeed3d55b','y907987244@gmail.com',1);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_article`
--

DROP TABLE IF EXISTS `user_article`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_article` (
  `account` varchar(12) NOT NULL,
  `article` text,
  `timestamp` varchar(15) NOT NULL,
  `title` varchar(30) NOT NULL,
  `brief_intro` varchar(100) NOT NULL,
  KEY `account` (`account`),
  CONSTRAINT `user_article_ibfk_1` FOREIGN KEY (`account`) REFERENCES `user` (`account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_article`
--

LOCK TABLES `user_article` WRITE;
/*!40000 ALTER TABLE `user_article` DISABLE KEYS */;
INSERT INTO `user_article` VALUES ('907987244','代码又重写了\n===\n**有时间的话需要去在实现几个快捷键**\n\n    class MainHandler(BaseHandler):\n        def haha():\n            print \"终于搞定了，去复习物理去啦～\"','1421664384.28','代码又重写了','昨天悲剧的删了python代码，从两天前开始写的，不过功能就都又实现了'),('907987244','这个东西就先用来当做记事本吧````\n===\n\n   今天，终于是把蛋疼的**电路理论**是给看完了，下来得开始继续复习*物理*了同时，因为命令是函数编程，和泛函程序分析考试的时间很是接近，所以说得加油干了啊。','1421665028.99','这个东西就先用来当做记事本吧````','要考试了哦，所以需要加油才是呢'),('907987244','又发现的问题\n===\n\n1. 首先是阻塞的问题，就是图片的产生似乎是阻塞的。这个问题有时间再看看。\n\n1. 还有就是对于不存在的图片我产生的好像不是404错误。','1421672111.51','又发现的问题','刚才测试又发现了一些问题'),('907987244','上面提到的问题已经解决了\n===\n\n1. 对于刚才的`403 forbidden`问题，因为查数据库的时候写错了。。。\n\n2. 对于阻塞的问题，似乎同一时间只能运行一个xvfb进程（因为是开线程跑的。。具体不太清楚，这方面的知识还没学），解决办法是，在图片的异步处理上开线程池的时候只开一个线程就不会出问题了。','1421678504.31','上面提到的问题已经解决了','关于阻塞和图片不存在的问题'),('907987244','博客的修改方案\n===\n之前想到的写博客的时候肯定是需要插入图片什么的。\n暂时的想法是对`addarticle`界面的输入框加上`drag`数据的功能，级拖入图片之后就可以看到。至于如何与服务器交互，考完试在想吧。','1422166883.13','博客的修改方案','又有了一些点子'),('907987244','物理的东西有点多啊\n===\n\n>赶快考完吧，考完就可以做自己喜欢的事情了，不要在浪费时间了，好好干吧。刚巴爹。','1422167355.64','物理的东西有点多啊','还得看物理，人生真是太悲惨了T T'),('907987244','就剩最后两科了，搞完就完事了\n===\n感觉*ML*其实讲的还好吧，赶快复习了，还有好多ppt要看....','1422338430.78','就剩最后两科了，搞完就完事了','到底还是的复习````');
/*!40000 ALTER TABLE `user_article` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-01-27 23:54:21
