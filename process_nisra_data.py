import csv

def process_nisra_data():
    # Process 2011 data
    with open('nisra_2011.csv', 'r') as f:
        reader = csv.reader(f)
        header = next(reader)
        print("2011 Header:", header)

    # Process 2021 data
    with open('nisra_2021.csv', 'r') as f:
        reader = csv.reader(f)
        header = next(reader)
        print("2021 Header:", header)

if __name__ == '__main__':
    process_nisra_data()
