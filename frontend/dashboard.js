async function loadDashboard() {
  const summaryRes = await fetch("http://localhost:5033/api/dashboard/summary");
  const summary = await summaryRes.json();

  document.getElementById("revenue").innerText = summary.totalRevenue;
  document.getElementById("orders").innerText = summary.totalOrders;
  document.getElementById("products").innerText = summary.totalProducts;
  document.getElementById("lowStock").innerText = summary.lowStockProducts;

  const insightRes = await fetch("http://localhost:5033/api/dashboard/insights");
  const insightData = await insightRes.json();

  document.getElementById("insight").innerText = insightData.insight;
}

loadDashboard();