<?php

namespace App\Controller;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Process\Process;


class MonitoringController extends AbstractController
{
    public string $host = 'localhost';
    public string $port = '3306';
    public string $dbname = 'smart_tribune';
    public string $username = 'root';
    public string $password = 'Minecraft01@';

    public array $Urls = [];
    public int $errorNum = 0;
    public int $onlineNum = 0;

    public function monitoring(): Response
    {
        $this->checkAllInfo();
        return $this->render('hackathon.html.twig', [
            'UrlStatus' => $this->updateStatus(),
            'errorNum' => $this->errorNum,
            'onlineNum' => $this->onlineNum
        ]);
    }


    private function executeCheck( $url ) : void
    {
        $command = 'node ../assets/getWidgetInfo.js ' . $url . ' 2>&1';

        $process = new Process(explode(' ', $command));
        $process->run();

        if ($process->isSuccessful()) {
            $this->addToStatusHistory( $process->getOutput() );
        }
    }

    private function checkAllUrls() : void
    {
        $dsn = "mysql:host=$this->host;port=$this->port;dbname=$this->dbname;charset=utf8mb4";
        $pdo = null;

        try {
            $pdo = new \PDO($dsn, $this->username, $this->password);
            $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        } catch (\PDOException $e) {
            echo 'Failed to connect to the database: ' . $e->getMessage();
        }

        $urls = $pdo->query('SELECT * FROM URL')->fetchAll(\PDO::FETCH_COLUMN);

        foreach ($urls as $url) {
            $this->executeCheck($url);
        }
    }

    private function addToStatusHistory( $data ) : void{
        $dsn = "mysql:host=$this->host;port=$this->port;dbname=$this->dbname;charset=utf8mb4";
        $pdo = null;

        try {
            $pdo = new \PDO($dsn, $this->username, $this->password);
            $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        } catch (\PDOException $e) {
            echo 'Failed to connect to the database: ' . $e->getMessage();
        }
        [$today, $status, $statusType, $url] = explode(' ', $data);

        $pdo->query("INSERT INTO STATUS (date, status, statusType, url) VALUES ('$today', '$status', '$statusType', '$url')");
    }

    private function checkLastInfo( $url ) : void{
        $dsn = "mysql:host=$this->host;port=$this->port;dbname=$this->dbname;charset=utf8mb4";
        $pdo = null;

        try {
            $pdo = new \PDO($dsn, $this->username, $this->password);
            $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        } catch (\PDOException $e) {
            echo 'Failed to connect to the database: ' . $e->getMessage();
        }
        $nameInfo = $pdo->query("select name from URL where id = '$url'")->fetchAll(\PDO::FETCH_COLUMN);
        $nameInfo = $nameInfo[0];
        $dateInfo = $pdo->query("select date from STATUS where url = '$url' order by id desc limit 1")->fetchAll(\PDO::FETCH_COLUMN);
        $dateInfo = $dateInfo[0];
        $statusInfo = $pdo->query("select status from STATUS where url = '$url' order by id desc limit 1")->fetchAll(\PDO::FETCH_COLUMN);
        $statusInfo = $statusInfo[0];
        $statusTypeInfo = $pdo->query("select statusType from STATUS where url = '$url' order by id desc limit 1")->fetchAll(\PDO::FETCH_COLUMN);
        $statusTypeInfo = $statusTypeInfo[0];
        $dic = ["name" => $nameInfo, "date" => $dateInfo, "status" => $statusInfo, "statusType" => $statusTypeInfo];
        array_push($this->Urls, $dic);
    }

    private function checkAllInfo() : void {
        $dsn = "mysql:host=$this->host;port=$this->port;dbname=$this->dbname;charset=utf8mb4";
        $pdo = null;

        try {
            $pdo = new \PDO($dsn, $this->username, $this->password);
            $pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        } catch (\PDOException $e) {
            echo 'Failed to connect to the database: ' . $e->getMessage();
        }

        $urls = $pdo->query('SELECT * FROM URL')->fetchAll(\PDO::FETCH_COLUMN);

        foreach ($urls as $url) {
            $this->checkLastInfo($url);
        }
    }

    private function updateStatus() : string{
        $result = "";
        foreach ($this->Urls as $url) {
            $statusclass = ($url['status'] === "ok") ? "online" : "error";
            if ($url['status'] === "ok") {
                $this->onlineNum++;
            } else {
                $this->errorNum++;
            }
            $result .= "<tr><td>{$url['name']}</td><td>{$url['date']}</td><td><span class='status $statusclass'>{$url['status']}</span></td></tr>";
        }
        return $result;
    }
}
