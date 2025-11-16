export namespace main {
	
	export class Item {
	    name: string;
	    newName: string;
	    path: string;
	    isDir: boolean;
	    size: number;
	    // Go type: time
	    modified: any;
	    items: Item[];
	
	    static createFrom(source: any = {}) {
	        return new Item(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.newName = source["newName"];
	        this.path = source["path"];
	        this.isDir = source["isDir"];
	        this.size = source["size"];
	        this.modified = this.convertValues(source["modified"], null);
	        this.items = this.convertValues(source["items"], Item);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class WorkingDirectoryEvent {
	    segments: string[];
	    path: string;
	    eventType: string;
	
	    static createFrom(source: any = {}) {
	        return new WorkingDirectoryEvent(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.segments = source["segments"];
	        this.path = source["path"];
	        this.eventType = source["eventType"];
	    }
	}

}

