import csv

def process_cso_data():
    with open('processed_cso_data.csv', 'w', newline='') as outfile:
        writer = csv.DictWriter(outfile, fieldnames=['Year', 'County', 'PercentageIrishSpeakers'])
        writer.writeheader()

        with open('cso_by_county.csv', 'r') as infile:
            reader = csv.DictReader(infile)
            for row in reader:
                county = row['County']
                if county == 'Total':
                    continue

                # 2011
                total_2011 = int(row['2011_Total'])
                irish_speakers_2011 = int(row['2011_Irish_Speakers'])
                percentage_2011 = (irish_speakers_2011 / total_2011) * 100 if total_2011 > 0 else 0
                writer.writerow({'Year': '2011', 'County': county, 'PercentageIrishSpeakers': percentage_2011})

                # 2016
                total_2016 = int(row['2016_Total'])
                irish_speakers_2016 = int(row['2016_Irish_Speakers'])
                percentage_2016 = (irish_speakers_2016 / total_2016) * 100 if total_2016 > 0 else 0
                writer.writerow({'Year': '2016', 'County': county, 'PercentageIrishSpeakers': percentage_2016})

                # 2022
                total_2022 = int(row['2022_Total'])
                irish_speakers_2022 = int(row['2022_Irish_Speakers'])
                percentage_2022 = (irish_speakers_2022 / total_2022) * 100 if total_2022 > 0 else 0
                writer.writerow({'Year': '2022', 'County': county, 'PercentageIrishSpeakers': percentage_2022})

if __name__ == '__main__':
    process_cso_data()
