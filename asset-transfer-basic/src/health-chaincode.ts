/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {
  Context,
  Contract,
  Info,
  Returns,
  Transaction,
} from "fabric-contract-api";
import stringify from "json-stringify-deterministic";
import sortKeysRecursive from "sort-keys-recursive";
import { Asset } from "./asset";

// type AssetType = {
//     ID: string;
//     Name: string;
//     Type: string;
//     IpAddress: string;
//     Available: boolean;
//     LastUpdate: number;
//     IsWearable: boolean;
//     GPSLocation: string;
//     Owner: OwnerType;
// }

// type OwnerType = {
//     Hospital: string;
//     Department: string;
//     ContactPerson: string;
// }

@Info({
  title: "Health Chaincode",
  description: "Smart contract for exchange of health/hospital assets",
})
export class HealthAssetTransferContract extends Contract {
  @Transaction()
  public async InitLedger(ctx: Context): Promise<void> {
    const assets: Asset[] = [
      {
        ID: "monitor1",
        Name: "Health Monitor",
        Type: "Walker",
        IpAddress: "0.0.0.0",
        Available: false,
        LastUpdate: 1710719049, // Unix timestamp
        IsWearable: false,
        GPSLocation: "0,0",
        Owner: {
          Hospital: "Hospital1",
          Department: "Department1",
          ContactPerson: "Person1",
          OwnerClientID: "fake-client-id-1",
        },
      },
      {
        ID: "monitor2",
        Name: "Health Monitor",
        Type: "Wearable",
        IpAddress: "0.0.0.0",
        Available: true,
        LastUpdate: 1710719049, // Unix timestamp
        IsWearable: true,
        GPSLocation: "0,0",
        Owner: {
          Hospital: "Hospital2",
          Department: "Department2",
          ContactPerson: "Person2",
          OwnerClientID: "fake-client-id-1",
        },
      },
      {
        ID: "monitor3",
        Name: "Health Monitor",
        Type: "Wearable",
        IpAddress: "0.0.0.0",
        Available: true,
        LastUpdate: 1710719049, // Unix timestamp
        IsWearable: true,
        GPSLocation: "0,0",
        Owner: {
          Hospital: "Hospital3",
          Department: "Department3",
          ContactPerson: "Person3",
          OwnerClientID: "fake-client-id-1",
        },
      },
      {
        ID: "smartwatch1",
        Name: "Apple Watch SE",
        Type: "Wearable",
        IpAddress: "0.0.0.0",
        Available: true,
        LastUpdate: 1710719049, // Unix timestamp
        IsWearable: true,
        GPSLocation: "0,0",
        Owner: {
          Hospital: "Hospital4",
          Department: "Department4",
          ContactPerson: "Person4",
          OwnerClientID: "fake-client-id-1",
        },
      },
    ];

    for (const asset of assets) {
      asset.docType = "asset";
      // example of how to write to world state deterministically
      // use convetion of alphabetic order
      // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
      // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
      await ctx.stub.putState(
        asset.ID,
        Buffer.from(stringify(sortKeysRecursive(asset)))
      );
      console.info(`Asset ${asset.ID} initialized`);
    }
  }

  // CreateAsset issues a new asset to the world state with given details.
  @Transaction()
  public async CreateAsset(
    ctx: Context,
    id: string,
    name: string,
    type: string,
    ipAddress: string,
    available: boolean,
    lastUpdate: number,
    isWearable: boolean,
    gpsLocation: string,
    hospital: string,
    department: string,
    contactPerson: string
  ): Promise<void> {
    // Atrtribute based access control
    const err = ctx.clientIdentity.assertAttributeValue("abac.creator", "true");
    if (err) {
      throw new Error(`Client is not authorized to create an asset`);
    }

    const exists = await this.AssetExists(ctx, id);
    if (exists) {
      throw new Error(`The asset ${id} already exists`);
    }

    const asset = {
      ID: id,
      Name: name,
      Type: type,
      IpAddress: ipAddress,
      Available: available,
      LastUpdate: lastUpdate,
      IsWearable: isWearable,
      GPSLocation: gpsLocation,
      Owner: {
        Hospital: hospital,
        Department: department,
        ContactPerson: contactPerson,
        OwnerClientID: ctx.clientIdentity.getID(), // get the client ID from the transaction context -> this is the client ID of the creator
      },
    };

    // emit event
    const eventPayload = JSON.stringify({
        asset: asset,
        requestedBy: ctx.clientIdentity.getID(),
        action: 'Write'
    })
    ctx.stub.setEvent("CreateAsset", Buffer.from(eventPayload));

    // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    await ctx.stub.putState(
      id,
      Buffer.from(stringify(sortKeysRecursive(asset)))
    );
  }

  // UpdateAsset updates an existing asset in the world state with provided parameters.
  @Transaction()
  public async UpdateAsset(
    ctx: Context,
    id: string,
    name: string,
    type: string,
    ipAddress: string,
    available: boolean,
    lastUpdate: number,
    isWearable: boolean,
    gpsLocation: string,
    hospital: string,
    department: string,
    contactPerson: string
  ): Promise<void> {
    const exists = await this.AssetExists(ctx, id);
    if (!exists) {
      throw new Error(`The asset ${id} does not exist`);
    }

    const clientIsOwner = await this.ClientIsOwner(ctx, id);
    if (!clientIsOwner) {
      throw new Error(
        `The asset ${id} is not owned by the client ${ctx.clientIdentity.getID()}`
      );
    }

    // overwriting original asset with new asset
    const updatedAsset = {
      ID: id,
      Name: name,
      Type: type,
      IpAddress: ipAddress,
      Available: available,
      LastUpdate: lastUpdate,
      IsWearable: isWearable,
      GPSLocation: gpsLocation,
      Owner: {
        Hospital: hospital,
        Department: department,
        ContactPerson: contactPerson,
        OwnerClientID: ctx.clientIdentity.getID(), // could also be taken from the original asset
      },
    };

    // emit event
    const eventPayload = JSON.stringify({
        asset: updatedAsset,
        requestedBy: ctx.clientIdentity.getID(),
        action: 'Write'
    })
    ctx.stub.setEvent("UpdateAsset", Buffer.from(eventPayload));

    // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    return ctx.stub.putState(
      id,
      Buffer.from(stringify(sortKeysRecursive(updatedAsset)))
    );
  }

  // DeleteAsset deletes an given asset from the world state.
  @Transaction()
  public async DeleteAsset(ctx: Context, id: string): Promise<void> {
    const exists = await this.AssetExists(ctx, id);
    if (!exists) {
      throw new Error(`The asset ${id} does not exist`);
    }

    const clientIsOwner = await this.ClientIsOwner(ctx, id);
    if (!clientIsOwner) {
      throw new Error(
        `The asset ${id} is not owned by the client ${ctx.clientIdentity.getID()}`
      );
    }

    // emit event
    const asset = await this.ReadAsset(ctx, id);
    const eventPayload = JSON.stringify({
        asset: asset,
        requestedBy: ctx.clientIdentity.getID(),
        action: 'Write'
    })
    ctx.stub.setEvent("DeleteAsset", Buffer.from(eventPayload));

    return ctx.stub.deleteState(id);
  }

  // TransferAsset updates the owner field of asset with given id in the world state, and returns the old owner.
  @Transaction()
  public async TransferAsset(
    ctx: Context,
    id: string,
    newOwner: string
  ): Promise<string> {
    const exists = await this.AssetExists(ctx, id);
    if (!exists) {
      throw new Error(`The asset ${id} does not exist`);
    }

    const clientIsOwner = await this.ClientIsOwner(ctx, id);
    if (!clientIsOwner) {
      throw new Error(
        `The asset ${id} is not owned by the client ${ctx.clientIdentity.getID()}`
      );
    }

    const assetString = await this.ReadAsset(ctx, id);
    const asset = JSON.parse(assetString);
    const oldOwner = asset.Owner.OwnerClientID;
    asset.Owner.OwnerClientID = newOwner;

    // emit event
    const eventPayload = JSON.stringify({
        asset: asset,
        requestedBy: ctx.clientIdentity.getID(),
        action: 'Write'
    })
    ctx.stub.setEvent("TransferAsset", Buffer.from(eventPayload));

    // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    await ctx.stub.putState(
      id,
      Buffer.from(stringify(sortKeysRecursive(asset)))
    );
    return oldOwner;
  }

  // ReadAsset returns the asset stored in the world state with given id.
  @Transaction()
  public async ReadAsset(ctx: Context, id: string): Promise<string> {
    const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
    if (!assetJSON || assetJSON.length === 0) {
      throw new Error(`The asset ${id} does not exist`);
    }

    // emit event for read
    const eventPayload = JSON.stringify({
        asset: assetJSON,
        requestedBy: ctx.clientIdentity.getID(),
        action: 'Read'
    })
    ctx.stub.setEvent("ReadAsset", Buffer.from(eventPayload));

    return assetJSON.toString();
  }

  // GetAllAssets returns all assets found in the world state.
  @Transaction()
  public async GetAllAssets(ctx: Context): Promise<string> {
    const allResults = [];
    // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
    const iterator = await ctx.stub.getStateByRange("", "");
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString(
        "utf8"
      );
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      allResults.push(record);
      result = await iterator.next();
    }

    // emit event for read
    const eventPayload = JSON.stringify({
        asset: allResults,
        requestedBy: ctx.clientIdentity.getID(),
        action: 'Read'
    })
    ctx.stub.setEvent("GetAllAssets", Buffer.from(eventPayload));
    
    return JSON.stringify(allResults);
  }

  // AssetExists returns true when asset with given ID exists in world state.
//   @Transaction(false)
//   @Returns("boolean")
  private async AssetExists(ctx: Context, id: string): Promise<boolean> {
    const assetJSON = await ctx.stub.getState(id);
    return assetJSON && assetJSON.length > 0;
  }

  private async ClientIsOwner(ctx, id: string): Promise<boolean> {
    const asset = await ctx.stub.getState(id); // get the asset from chaincode state
    const assetJSON = JSON.parse(asset.toString());
    return assetJSON.Owner.OwnerClientID === ctx.clientIdentity.getID();
  }
}
