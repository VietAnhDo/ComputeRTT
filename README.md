<h1>Contributors :</h1>
    Do Viet Anh     -MSV: 13020752
    Le Truong Giang -MSV: 13020730
    Thai Dinh Phuc  -MSV: 13020758
    Cao Minh Son    -MSV: 13020650
    Nguyễn Tiến Việt



# ComputeRTT
Compute RTT of the first stream in csv input file and display result on line chart
<h2>How to run</h2>
- run main.html and choose the input csv file( that export from wireshark ) from your local memory
- click Compute RTT
<h2>Explaination</h2>
- Phase 1: Parse CSV file ( using <a href='http://papaparse.com/'>papaparse</a> )
- Phase 2: Compute RTT and return a Array of pair of sequence number and RTT
- Phase 3: Display on line chart ( using <a href='https://developers.google.com/chart/'>google chart</a> )
<h3>Phase 2 details</h3>
- Detect the first stream ( first SYN packet )
- For each row ( packet ) belongs to the stream
  - if this packet is outgoing (e.g: src:dstPort==synPacket.src:srcPort && dst:dstPort==synPacket.dst:dstPort ) packet (  populate that to the Container ( a Array )
  - if this packet is incoming (e.g: dst:dstPort==synPacket.src:srcPort && src:srcPort==synPacket.dst:dstPort )packet find the sent packet follow the condition:
    - incomming packet Acknowledgment number (Ack) == outgoing packet Sequence number(Seq) + outgoing packet Length (Len)
    - difference time of them is RTT
    - remove that incoming packet from Container


