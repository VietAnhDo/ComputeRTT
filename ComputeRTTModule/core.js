var outgoingPacketContainer;
var RTTdata;
// Begin parse csv file using papaparse lib
$(function()
{
	$('#submit-parse').click(function()
	{
		$('#files').parse({
			config: buildConfig(),
			before: function(file, inputElem)
			{
				console.log("Parsing file:", file);
			},
			complete: function()
			{
				console.log("Done with all files.");
			}
		});
		
	});
});

function buildConfig()
{
	return {
		complete: completeFn,
		error: errorFn,
	};
}
function errorFn(error, file)
{
	console.log("ERROR:", error, file);
}

function completeFn(results, file)
{
	console.log(results);
	console.log(results.data.length);
	outgoingPacketContainer = [];
	RTTdata = computeRTT(results.data);
	loadChart();
}
// End parse csv file using papaparse lib
/**
  @brief compute RTT of the first connection in data and return results for visualization ( line chart )
	@params data
	@return results ( object with data for chart and synPacket)
*/
function computeRTT(data) {
	var valueObject;
	var temp;
	var isDisconnected = false;
	var results = {
		data:[], 
		synPacket:null
	};
	// begin examine each row of the data
	$.each(data, function(index, row){
		if(isDisconnected)
			return null;
		// begin solve for each row of the data
		if( isValidRow(row) ) {
			valueObject = getValueObject(row);
			if( results.synPacket == null && isSynPacket(valueObject)) {
				results.synPacket = valueObject;
			}
			if( results.synPacket!=null && isFinPacket(valueObject, results.synPacket)) {
				console.log("FIN--------------"+row);
				isDisconnected = true;
				return null;
			}
			if( results.synPacket != null && row[4]=='TCP') {
				if( isOutgoingPacket(valueObject, results.synPacket) ) {
					outgoingPacketContainer.push(valueObject);
				}
				else if( isIncomingPacket(valueObject, results.synPacket) && parseInt(valueObject.ack) > 1) {
					temp = getRTT(valueObject);
					if( temp[0] == null ) {
						console.log('------------null');
						console.log(row);
					}else {
						results.data.push( temp );
					}
				}else {
					console.log("can't to understood row:");
					console.log(row);
					console.log(valueObject);
				}
			}
			else {
				console.log("-----" + row);
			}
		}
		else {
			console.log("Invalid row:");
			console.log(row);
		}
		// end solve for each row of the data
	});
	// end examine each row of the data
	return results;
}
/**
	@params row : Array with 7 elemment ( no, time, source, destination, protocol, length and info )
	@return a object ( with time, source, destination, Seq, Ack and Len)
*/
function getValueObject(row) {
	return { 
		time: row[1],
		src: row[2],
		srcPort: getSrcPort(row[6]).trim(),
		dst: row[3],
		dstPort: getDstPort(row[6]).trim(),
		seq: getSeq(row[6]),
		ack: getAck(row[6]),
		len: getLen(row[6]),
		info: row[6]
	};
}
function getSrcPort(info) {
	var index = info.indexOf('>') - 1;
	while(info.charAt(index)==' ')index--;
	while(info.charAt(index)>='0' && info.charAt(index)<='9')index--;
	return info.substring(index, info.indexOf('>'));
}
function getDstPort(info) {
	var index = info.indexOf('>') + 1;
	while(info.charAt(index)==' ')index++;
	return info.substring(index, info.indexOf(' ', index));
}
/**
	@brief get Seq number from info
*/
function getSeq(info) {
	return info.substring(
		info.indexOf('Seq=')+4,
		info.indexOf(' ', info.indexOf('Seq='))
	);
}
/**
	@brief get Ack number from info
*/
function getAck(info) {
	return info.substring(
		info.indexOf('Ack=')+4,
		info.indexOf(' ', info.indexOf('Ack='))
	);
}
/**
	@brief get Len number from info
*/
function getLen(info) {
	for(var i = info.indexOf('Len=')+4; i<=info.length; i++) {
		if( i == info.length || info.charAt(i) < '0' || info.charAt(i) > '9' ) 
			return info.substring(info.indexOf('Len=')+4, i);
	}
	alert("can't to find Len at info " + info);
	return null;
}
/**
	@brief check whether row is valid for problem or not
	@params row
	@return true if valid otherwise false
*/
function isValidRow(row) {
	return ( row.length == 7 );
}
/**
	@brief check whether packet is outgoing packet or not in this connection
*/
function isOutgoingPacket(packet, synPacket) {
	return isTheSameStream(packet, synPacket)==1;
}
/**
  @brief check wheather packet is incoming packet or not in this connection
*/
function isIncomingPacket(packet, synPacket) {
	return isTheSameStream(packet,synPacket)==-1;
}
/**
	@brief compute RTT and return pair of sequence number and time [sequence number, time]
*/
function getRTT(packet) {
	var result = null;
	$.each(outgoingPacketContainer, function(index, value){
		if( result != null ) return null;
		if( parseFloat(value.seq) + parseFloat(value.len) == parseFloat(packet.ack) ) {
			result = [parseInt(packet.ack), parseFloat(packet.time) - parseFloat(value.time)];
			outgoingPacketContainer.splice(index, 1);
		}
	});
	if( result != null) {
		return result;
	}
	return [null, null];
}
function isSynPacket(packet) {
	return packet.info.indexOf("SYN") != -1;
}
function isFinPacket(packet, synPacket) {
	return ( packet.info.indexOf("FIN") != -1 && isTheSameStream(packet, synPacket)!=0	);
}
function isTheSameStream(packetA, packetB) {
	if(packetA.src==packetB.src && packetA.srcPort==packetB.srcPort && packetA.dst==packetB.dst && packetA.dstPort==packetB.dstPort)
		return 1;
	if(packetA.src==packetB.dst && packetA.srcPort==packetB.dstPort && packetA.dst==packetB.src && packetA.dstPort==packetB.srcPort)
		return -1;
	return 0;
}