const Papa = require('papaparse');
const https = require('https');

const SHEET_ID = "1q0uo0aXUKtGS-Xk31YAMNV-Scld3hANw4reod7U-nMA";
const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Scope2_Purchased_Electricity`;

https.get(url, (res) => {
    let raw = "";
    res.on("data", c => raw += c);
    res.on("end", () => {
        Papa.parse(raw, {
            header: true,
            transformHeader: h => h.trim(),
            skipEmptyLines: true,
            complete: (results) => {
                const cleaned = results.data.filter(row => Object.values(row).some(v => v && v.trim() !== ''));

                const computeFields = [
                    {
                        targetKey: 'Final Emissions (kg CO2e)',
                        formula: (row) => {
                            const net = parseFloat((row['Net Grid Electricity (kWh)'] || '0').replace(/,/g, ''));
                            const ef = parseFloat((row['Emission Factor (KgCO2e/KWh)'] || '0').replace(/,/g, ''));
                            return net * (isNaN(ef) ? 0 : ef);
                        }
                    }
                ];

                cleaned.forEach(row => {
                    computeFields.forEach(cf => {
                        row[cf.targetKey] = String(cf.formula(row));
                    });
                });

                let allRecords = [];
                const seenElectricity = new Set();
                
                cleaned.forEach(row => {
                    const year = (row['Reporting Year'] || '').trim();
                    const month = (row['Month'] || '').trim();
                    
                    if (year) {
                        const values = {};
                        // Mock columns
                        const columns = [
                            { key: 'Final Emissions (kg CO2e)', type: 'numeric' },
                        ];
                        
                        columns.forEach(col => {
                            if (col.type === 'numeric') {
                                const valStr = row[col.key] || '0';
                                const val = parseFloat(valStr.replace(/,/g, ''));
                                values[col.key] = isNaN(val) ? 0 : val;
                            }
                        });

                        allRecords.push({ year, month, values });

                        const dKey = `${year}-${month}`;
                        if (!seenElectricity.has(dKey)) {
                            seenElectricity.add(dKey);
                            
                            const sKey = Object.keys(row).find(k => k.toLowerCase().includes('solar'));
                            const wKey = Object.keys(row).find(k => k.toLowerCase().includes('wind'));
                            const efKey = Object.keys(row).find(k => k.toLowerCase().includes('factor') && k.toLowerCase().includes('kg'));
                            
                            const solar = parseFloat(parseFloat((row[sKey || ''] || '0').replace(/,/g, '')).toString());
                            const wind = parseFloat(parseFloat((row[wKey || ''] || '0').replace(/,/g, '')).toString());
                            const ef = parseFloat(parseFloat((row[efKey || ''] || '0').replace(/,/g, '')).toString());
                            
                            const offset = ((isNaN(solar) ? 0 : solar) + (isNaN(wind) ? 0 : wind)) * (isNaN(ef) ? 0 : ef);
                            console.log(`[Phantom] ${month} ${year} - Solar: ${solar}, Wind: ${wind}, EF: ${ef}, Offset: ${offset}`);
                            
                            if (offset > 0) {
                                 allRecords.push({
                                     year, month,
                                     values: {
                                         'Final Emissions (kg CO2e)': -offset
                                     }
                                 });
                            }
                        }
                    }
                });

                const total = allRecords.reduce((acc, r) => acc + (r.values['Final Emissions (kg CO2e)'] || 0), 0);
                console.log("Total aggregated:", total, "kg CO2e");
            }
        });
    });
});
