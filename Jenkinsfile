#!groovy
@Library('pipeline-library') _

timestamps {
	node('git && (osx || linux) && !master') {
		stage('Checkout') {
			checkout scm
		}

		stage('Configuration') {
			sh "echo \"module.exports = { connectors: { 'appc.azure': { azure_account: 'connectortest', azure_key: '6cBv7uLbzqKuwQCNo47+57w4Irrhry5cmrvQCYs0nkmm0o8aCfhs94DrqyE/j2VJzQmDMIZa49IHCG2lNO9kUQ==' } } };\" > conf/local.js"
		}

		buildConnector {
			// don't override anything yet
		}
	}
}
