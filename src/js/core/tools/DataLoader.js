import CoreFeature from '../CoreFeature.js';

export default class DataLoader extends CoreFeature{
	constructor(table){
		super(table);

		this.loaderElement = this.createLoaderElement(); //loader message div
		this.msgElement = this.createMsgElement(); //message element
		this.loadingElement = null;
		this.errorElement = null;
	}

	initialize(){
		var template;

		this.loaderElement.appendChild(this.msgElement);

		if(this.table.options.dataLoaderLoading){
			if(typeof this.table.options.dataLoaderLoading == "string"){
				template = document.createElement('template');
				template.innerHTML = this.table.options.dataLoaderLoading.trim();
				this.loadingElement = template.content.firstChild;
			}else{
				this.loadingElement = this.table.options.dataLoaderLoading;
			}
		}

		if(this.table.options.dataLoaderError){
			if(typeof this.table.options.dataLoaderError == "string"){
				template = document.createElement('template');
				template.innerHTML = this.table.options.dataLoaderError.trim();
				this.errorElement = template.content.firstChild;
			}else{
				this.errorElement = this.table.options.dataLoaderError;
			}
		}
	}

	createLoaderElement(){
		var el = document.createElement("div");
		el.classList.add("tabulator-loader");
		return el;
	}

	createMsgElement(){
		var el = document.createElement("div");

		el.classList.add("tabulator-loader-msg");
		el.setAttribute("role", "alert");

		return el;
	}

	load(data, params, replace){
		//parse json data to array
		if (data && (data.indexOf("{") == 0 || data.indexOf("[") == 0)){
			data = JSON.parse(data);
		}

		if(this.confirm("data-load", data)){
			console.log("remote")
			//TODO - update chain function to take intitial value for the chain (pass in the params option)

			//get params for request
			var params = this.chain("data-requesting", data, {});

			//TODO - loading table data - show spinner

			this.showLoader();

			var result = this.chain("data-request", [data, params], Promise.resolve([]));

			result.then((rowData) => {
				this.hideLoader();
				this.table.rowManager.setData(rowData,  replace, !replace);
			}).catch((error) => {
				console.error("Data Load Error: ", error);
				this.dispatchExternal("dataError", error);

				this.showError();

				setTimeout(() => {
					this.hideLoader();
				}, 3000);
			})

			//load data from module
		}else{
			console.log("local");
			//load data into table
			this.table.rowManager.setData(data, replace, !replace);
		}
	}

	showLoader(){
		var shouldLoad = typeof this.table.options.dataLoader === "function" ? this.table.options.dataLoader() : this.table.options.dataLoader;
		console.log("show", this.table.options.dataLoader);
		if(shouldLoad){

			this.hideLoader();



			while(this.msgElement.firstChild) this.msgElement.removeChild(this.msgElement.firstChild);
			this.msgElement.classList.remove("tabulator-error");
			this.msgElement.classList.add("tabulator-loading");

			if(this.loadingElement){
				this.msgElement.appendChild(this.loadingElement);
			}else{
				this.msgElement.innerHTML = this.table.modules.localize.getText("data|loading");
			}

			this.table.element.appendChild(this.loaderElement);
		}
	}

	showError(){
		this.hideLoader();

		while(this.msgElement.firstChild) this.msgElement.removeChild(this.msgElement.firstChild);
		this.msgElement.classList.remove("tabulator-loading");
		this.msgElement.classList.add("tabulator-error");

		if(this.errorElement){
			this.msgElement.appendChild(this.errorElement);
		}else{
			this.msgElement.innerHTML = this.table.modules.localize.getText("data|error");
		}

		this.table.element.appendChild(this.loaderElement);
	}


	hideLoader(){
		if(this.loaderElement.parentNode){
			this.loaderElement.parentNode.removeChild(this.loaderElement);
		}
	}
}