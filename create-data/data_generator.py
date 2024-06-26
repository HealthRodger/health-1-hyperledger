import sys
import json
import random
from faker import Faker #pip install Faker


def main():

    # Read the parameters from command line
    amount = sys.argv[1]
    file_type = sys.argv[2]

    fake = Faker()
    data = []

    # If generating csv files, save the headers
    if file_type == "csv":
        data.append("id,name,type,ipAddress,available,lastUpdate,isWearable,gpsLocation,hospital,department,contactPerson")

    # Generate dummy data
    for i in range(int(amount)):

        wearable = fake.boolean()
        id = random.randrange(10000, 100000)  # ID will be a string anyway

        # Choose name and type based on if device is a wearable
        if wearable:
            type1 = random.choice(["fitness tracker", "smart watch", "ecg monitor", "blood pressure monitor",
                                  "glucose meter", "biosensor"])
            name = type1 + " " + str(random.randrange(100, 1000))
        else:
            name = random.choice(["x-ray machine", "ultrasound", "MRI", "PET", "CT",
                                  "ventilator", "incubator", "anaesthetic machine",
                                  "dialysis machine", "air purifier", "laser",
                                  "defibrillator", "autoclave", "centrifuge"]) + " " + str(random.randrange(100, 1000))
            type1 = random.choice(["diagnostic", "treatment", "life support", "medical monitor"
                                   "laboratory equipment", "other"])
        ip = fake.ipv4()
        available = fake.boolean()
        update = str(fake.unix_time())  # default between Jan. 1st 1970 and today

        gps = ""  # 5 decimals is 1 m resolution, 6 is 10 cm

        # Give wearable devices a gps location
        if wearable:
            lat = random.uniform(-90.00000, 90.00000)
            long = random.uniform(-180.00000, 180.00000)
            lat = round(lat, 5)
            long = round(long, 5)
            gps = gps + str(lat) + ", " + str(long)

            # If generating csv, enclose coordinates in " to protect comma
            if file_type == "csv":
                gps = "\"" + str(lat) + ", " + str(long) + "\""
        else:
            gps = "n/a"

        hospital = fake.word() + " hospital"
        department = random.choice(["Cardiology", "Emergency", "Anesthesiology", "ENT",
                                    "Neurology", "Psychiatry", "Radiology", "Geriatric",
                                    "Oncology", "Hematology"])

        person = fake.name()

        # Add device to list of data
        if file_type == "json":
            device = {"device": {
                            "id": id,
                            "name": name,
                            "type": type1,
                            "ip address": ip,
                            "available": available,
                            "last service/update": update,
                            "wearable": wearable,
                            "gps location": gps
                        },
                       "owner": {
                           "hospital": hospital,
                            "department": department,
                            "contact person": person
                       }
                      }
            data.append(device)

        if file_type == "csv":
            device = "" + str(id) + "," + name + "," + type1 + "," + ip + "," + str(available).lower() + "," + update + "," + str(wearable).lower() + "," + gps + "," + hospital + "," + department + "," + person
            data.append(device)

    # Write all data to file
    if file_type == "json":
        with open("data.json", "w") as file:
            json.dump(data, file)

    elif file_type == "csv":
        with open("data.csv", "w") as file:
            for line in data:
                file.write(line + "\n")

    else:
        print("failed due to invalid file type")


if __name__=="__main__":
    main()