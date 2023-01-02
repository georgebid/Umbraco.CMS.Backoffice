import { Observable } from 'rxjs';
import { UmbObserver } from './observer';
import type { UmbControllerInterface } from 'src/core/controller/controller.interface';
import { UmbControllerHostInterface } from 'src/core/controller/controller-host.mixin';


export class UmbObserverController<Y = any> extends UmbObserver<Y> implements UmbControllerInterface {
   
    constructor(host:UmbControllerHostInterface, source: Observable<any>, callback: (_value: Y) => void) {
        super(source, callback);
        // TODO: What should happen if source or some? identifier is already present?
        host.addController(this);
    }

	hostConnected() {
        return;
	}

}