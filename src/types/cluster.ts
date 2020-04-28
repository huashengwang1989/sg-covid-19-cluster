import { Position } from 'geojson'
export interface Cluster {
    uid: string,
    type: Array<'govt' | 'religion' | 'family' | 'school' | 'company' | 'dorm' | 'construction' | 'gathering' | 'fnb' | 'entertainment' | 'residence' | 'old-age' | 'mall' | 'industrial' | 'hotel' | 'shop'>,
    name: string,
    cnName?: string,
    short?: string,
    sort?: string,
    addresses?: string[],
    origin?: Array<string | number>,
    originType?: 'cluster' | 'import',
    originNote?: string,
    people: number[],
    total?: number,
    isNotOfficial?: boolean, // e.g., imported group is not counted as official cluster
    remarks?: string,
    sources?: string[],
    updates?: Record<string, number>,
    geopoints?: Position[],
}
