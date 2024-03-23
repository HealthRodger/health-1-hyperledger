/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Asset {
    @Property()
    public docType?: string;

    @Property()
    public ID: string;

    @Property()
    public Name: string;

    @Property()
    public Type: string;

    @Property()
    public IpAddress: string;

    @Property()
    public Available: boolean;

    @Property()
    public LastUpdate: number;

    @Property()
    public IsWearable: boolean;

    @Property()
    public GPSLocation: string;

    @Property()
    public Owner: OwnerType;
}

@Object()
export class OwnerType {
    @Property()
    public Hospital: string;

    @Property()
    public Department: string;

    @Property()
    public ContactPerson: string;

    @Property()
    public OwnerClientID: string;
}