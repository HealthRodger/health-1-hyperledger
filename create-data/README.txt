# Generating Data

To generate dummy hospital device data use run the following command:

```bash
python data_generator.py [number of devices] [type of file]
```


For number of devices: provide the desired number of entries (positive integer)

For type of file: choose either 'csv' or 'json'

Depending on the type of file chosen either a data.json or data.csv file will be created.

#### Examples:
```bash
python data_generator.py 50 json
python data_generator.py 20 csv
```