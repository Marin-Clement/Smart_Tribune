urls = [{}]

function updateStatus(){
  const tbody = document.querySelector("tbody");

  urls.forEach(function(data) {
    const tr = document.createElement("tr");
    const tdName = document.createElement("td");
    const tdDate = document.createElement("td");
    const tdStatus = document.createElement("td");
    const spanStatus = document.createElement("span");

    spanStatus.className = "status " + (data.status === "OK" ? "online" : "error");

    tdName.innerHTML = "<p>" + data + "</p>";

    tdStatus.appendChild(spanStatus);
    tr.appendChild(tdName);
    tr.appendChild(tdDate);
    tr.appendChild(tdStatus);
    tbody.appendChild(tr);
  });
}

function updateStatusCount() {
  const statusCount = countStatus();
  const errorCount = statusCount.errorCount;
  const onlineCount = statusCount.onlineCount;

  const statusTextError = document.getElementById("status-text-error");
  const statusTextOnline = document.getElementById("status-text-online");

  statusTextError.textContent = errorCount.toString();
  statusTextOnline.textContent = onlineCount.toString();
}

updateStatus();
updateStatusCount();