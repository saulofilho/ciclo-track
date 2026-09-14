import { RideSession } from '../types';

/**
 * Generates and triggers download of a standardized GPX (GPS Exchange Format) file
 */
export function exportToGPX(ride: RideSession) {
  const pointsXml = ride.route
    .map(
      (pt) => `      <trkpt lat="${pt.lat.toFixed(6)}" lon="${pt.lng.toFixed(6)}">
        <ele>${pt.altitude.toFixed(1)}</ele>
        <time>${new Date(pt.timestamp).toISOString()}</time>
        <extensions>
          <speed>${(pt.speed / 3.6).toFixed(2)}</speed>
          ${pt.heartRate ? `<hr>${pt.heartRate}</hr>` : ''}
          ${pt.cadence ? `<cadence>${pt.cadence}</cadence>` : ''}
        </extensions>
      </trkpt>`
    )
    .join('\n');

  const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="CicloTrack Pro - https://ciclotrack.app" version="1.1" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${ride.title}</name>
    <time>${new Date(ride.startTime).toISOString()}</time>
    <desc>Pedalada gravada no CicloTrack Pro com métricas de velocidade, FC e elevação.</desc>
  </metadata>
  <trk>
    <name>${ride.title}</name>
    <type>cycling</type>
    <trkseg>
${pointsXml}
    </trkseg>
  </trk>
</gpx>`;

  downloadFile(gpxContent, `pedalada-${ride.id}.gpx`, 'application/gpx+xml');
}

/**
 * Generates and triggers download of TCX (Garmin Training Center XML) format
 */
export function exportToTCX(ride: RideSession) {
  const trackpointsXml = ride.route
    .map(
      (pt) => `        <Trackpoint>
          <Time>${new Date(pt.timestamp).toISOString()}</Time>
          <Position>
            <LatitudeDegrees>${pt.lat.toFixed(6)}</LatitudeDegrees>
            <LongitudeDegrees>${pt.lng.toFixed(6)}</LongitudeDegrees>
          </Position>
          <AltitudeMeters>${pt.altitude.toFixed(1)}</AltitudeMeters>
          ${
            pt.heartRate
              ? `<HeartRateBpm><Value>${pt.heartRate}</Value></HeartRateBpm>`
              : ''
          }
          ${pt.cadence ? `<Cadence>${pt.cadence}</Cadence>` : ''}
          <Extensions>
            <TPX xmlns="http://www.garmin.com/xmlschemas/ActivityExtension/v2">
              <Speed>${(pt.speed / 3.6).toFixed(2)}</Speed>
            </TPX>
          </Extensions>
        </Trackpoint>`
    )
    .join('\n');

  const tcxContent = `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2">
  <Activities>
    <Activity Sport="Biking">
      <Id>${new Date(ride.startTime).toISOString()}</Id>
      <Lap StartTime="${new Date(ride.startTime).toISOString()}">
        <TotalTimeSeconds>${ride.duration}</TotalTimeSeconds>
        <DistanceMeters>${(ride.distance * 1000).toFixed(1)}</DistanceMeters>
        <MaximumSpeed>${(ride.maxSpeed / 3.6).toFixed(2)}</MaximumSpeed>
        <Calories>${ride.calories}</Calories>
        ${
          ride.avgHeartRate
            ? `<AverageHeartRateBpm><Value>${ride.avgHeartRate}</Value></AverageHeartRateBpm>`
            : ''
        }
        ${
          ride.maxHeartRate
            ? `<MaximumHeartRateBpm><Value>${ride.maxHeartRate}</Value></MaximumHeartRateBpm>`
            : ''
        }
        <Intensity>Active</Intensity>
        <TriggerMethod>Manual</TriggerMethod>
        <Track>
${trackpointsXml}
        </Track>
      </Lap>
    </Activity>
  </Activities>
</TrainingCenterDatabase>`;

  downloadFile(tcxContent, `pedalada-${ride.id}.tcx`, 'application/vnd.garmin.tcx+xml');
}

/**
 * Exports complete workout data as JSON for backup and external platforms
 */
export function exportToJSON(ride: RideSession) {
  const jsonString = JSON.stringify(ride, null, 2);
  downloadFile(jsonString, `treino-${ride.id}.json`, 'application/json');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
