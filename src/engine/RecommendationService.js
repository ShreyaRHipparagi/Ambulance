import DijkstraEngine from './DijkstraEngine.js';

export default class RecommendationService {
  constructor(graph, hospitals) {
    this.graph = graph;
    this.hospitals = hospitals;
    this.dijkstra = new DijkstraEngine(graph);
  }

  recommend(request) {
    const { sourceNodeId, emergencyType, needsIcu, useTraffic = true } = request;
    const filterSteps = [];

    // Step 1: Filter by Specialization
    let candidates = this.hospitals.filter(h => h.specializations.includes(emergencyType));
    filterSteps.push({
      step: 'Specialization Filter',
      description: `Filtering hospitals that can handle ${emergencyType} emergencies.`,
      hospitals: candidates.map(h => h.name),
      count: candidates.length
    });

    // Step 2: Filter by Bed Availability
    candidates = candidates.filter(h => {
      if (needsIcu) return h.icuBedsAvailable > 0;
      return h.generalBedsAvailable > 0;
    });
    filterSteps.push({
      step: 'Bed Availability Filter',
      description: `Filtering hospitals with available ${needsIcu ? 'ICU' : 'General'} beds.`,
      hospitals: candidates.map(h => h.name),
      count: candidates.length
    });

    // Step 3: Run Dijkstra for each remaining hospital to find reachable ones and cost
    const validCandidates = [];
    for (const hospital of candidates) {
      const result = this.dijkstra.run(sourceNodeId, hospital.nodeId, useTraffic);
      if (result.found) {
        validCandidates.push({
          hospital,
          cost: result.cost,
          path: result.path,
          reason: `Can handle ${emergencyType}, has ${needsIcu ? 'ICU' : 'General'} beds, reachable in ${result.cost.toFixed(1)} km`
        });
      }
    }
    
    // Sort by cost ascending
    validCandidates.sort((a, b) => a.cost - b.cost);

    filterSteps.push({
      step: 'Shortest Path Routing',
      description: `Ran Dijkstra's algorithm. Sorted remaining hospitals by travel cost.`,
      hospitals: validCandidates.map(c => c.hospital.name),
      count: validCandidates.length
    });

    return {
      primary: validCandidates.length > 0 ? validCandidates[0] : null,
      backup: validCandidates.length > 1 ? validCandidates[1] : null,
      allCandidates: validCandidates,
      filterSteps,
      explanation: validCandidates.length > 0 
        ? `Selected ${validCandidates[0].hospital.name} as primary because it is the closest hospital (${validCandidates[0].cost.toFixed(1)} km) that has available ${needsIcu ? 'ICU' : 'General'} beds and specializes in ${emergencyType}.`
        : `No hospitals match all criteria. Consider relaxing constraints (e.g. ICU requirement).`
    };
  }
}
