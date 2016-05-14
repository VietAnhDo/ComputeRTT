google.charts.load('current', {packages: ['corechart', 'line']}); 
function loadChart() {
  google.charts.setOnLoadCallback(drawBackgroundColor);

  function drawBackgroundColor() {
    var data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    data.addColumn('number', 'RTT(ms)');

    data.addRows(
      RTTdata.data
    );

    var options = {
      hAxis: {
        title: 'Sequence Number(B)'
      },
      vAxis: {
        title: 'Round Trip Time(ms)'
      },
      backgroundColor: '#f1f8e9',
      height: 500,
      explorer: {
        maxZoomOut:5,
        keepInBounds: true
      },
      title: 'Round Trip Time for ' 
             + RTTdata.synPacket.src + ':' + RTTdata.synPacket.srcPort 
             + " -> " 
             + RTTdata.synPacket.dst + ":" + RTTdata.synPacket.dstPort
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    chart.draw(data, options);
  }
}