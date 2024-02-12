import { EventManagerAware } from "@dsign/library/src/event";

/**
 * @class AuthService
 */
export class AuthService extends EventManagerAware {

    static get ORGANIZATION_ID() { return 'token'; }

    static get USER_TOKEN_ID() { return 'user-token'; }

    static get LOGIN() { return 'login'; }

    static get LOGOUT() { return 'logout'; }

    static get LOADED_ORGANIZATION_FROM_TOKEN() { return 'loaded-organization-from-token'; }

    static get RESET_ORGANIZATION_FROM_TOKEN() { return 'reset-organization-from-token'; }

    static get LOAD_IDENTITY_EVT() { return 'loaded-identity'; }

    constructor(storage, xmlHttpAdapter, clientId, clientSecret) {
        super();

        this.organizationToken = null;

        this.userToken = null;

        this.storage = storage;

        this.xmlHttpAdapter = xmlHttpAdapter;

        this.storage.get(AuthService.ORGANIZATION_ID)
            .then((data) => {
                if (data) {
                    this.setOrganizationToken(data.token);
                }
           
            }).catch((error) => {
                this.setOrganizationToken(null);
                console.error(error);
            });

        this.storage.get(AuthService.USER_TOKEN_ID)
            .then((data) => {
                if (data) {
                  
                    this.setUserToken(data);
                }
           
            }).catch((error) => {
                this.setUserToken(null);
                console.error(error);
            });    

        
        this.organization = null;

        this.identity = null;

        this.clientSecret = clientSecret;

        this.clientId = clientId;
    }

    getOrganization() {
        return this.organization;
    }

    getIdentity() {
        return this.identity;
    }

    /**
     * @returns string
     */
    getOrganizationToken() {
        return this.organizationToken;
    }

    /**
     * @param {string} token 
     * @returns 
     */
    setOrganizationToken(token, name) {

        this.organizationToken = token;
        if (token) {
            this.xmlHttpAdapter.addHeader('Authorization', `Bearer ${token}`);
        } else {
            this.xmlHttpAdapter.removeHeader('Authorization');
        }
        
        let tokenObj = {
            "id": AuthService.ORGANIZATION_ID,
            "token": token
        };

        if (name) {
            tokenObj.name = name;
        }

        // TODO add function to class ????
        this.xmlHttpAdapter.nameResource = 'my-org' ;
        this.xmlHttpAdapter.get('').then(
            (data) => {
                this.organization = data;
                this.getEventManager().emit(
                    AuthService.LOADED_ORGANIZATION_FROM_TOKEN,
                    this.organization 
                )
            }
        ).catch((error) => {
            this.organization = null;
            this.getEventManager().emit(
                AuthService.RESET_ORGANIZATION_FROM_TOKEN,
                {}
            )
        });

        return this.storage.save(tokenObj);
    }

    getUserToken() {
        return this.userToken;
    }

    setUserToken(token) {

        return new Promise((resolve, reject) => {


            token.id = AuthService.USER_TOKEN_ID;
            this.storage.save(token);

            if (token && token.access_token) {
                this.xmlHttpAdapter.addHeader('Authorization', `Bearer ${token.access_token}`);
            } 
    
            // TODO add function to class ????
            this.xmlHttpAdapter.nameResource = 'me' ;
            this.xmlHttpAdapter.get('').then(
                (data) => {
    
                    this.identity = data;
                    this.getEventManager().emit(
                        AuthService.LOAD_IDENTITY_EVT,
                        this.identity
                    )
                    
                }
            ).catch((error) => {                
                this.identity = null;
            });
    
    
            this.userToken = token;
            return this;
        });
    }

    /**
     * @param {string} username 
     * @param {string} password 
     */
    login(username, password) {

        return new Promise((resolve, reject) => {
           
            let postData = {
                'username': username,
                'password': password,
                'scope': 'basic email',
                'client_secret': this.clientSecret,
                'client_id': this.clientId,
                'grant_type': 'password'
    
            }

            console.log(postData);
    
            this.xmlHttpAdapter.nameResource = 'access-token';
            this.xmlHttpAdapter.save(postData).then(
                (data) => {
                    
                    this.setUserToken(data).then((data) => {
                        this.getEventManager().emit(
                            AuthService.LOGIN,
                            this.userToken
                        );

                        resolve(data);

                    });
                }
            ).catch((error) => {
                reject(error);
            });
        });        
    }

    logout() {
        if (this.userToken) {
            this.storage.delete(this.userToken);
            this.getEventManager().emit(
                AuthService.LOGOUT,
                this.userToken
            );
        }
        
    }
}