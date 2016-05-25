module.exports = function(grunt) {
	
	//config
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			my_target: {
				files: {
					'dist/animaScript.min.js': ['dist/animaScript.js']
				}
			}
		}
	});
	
	//load uglify
	grunt.loadNpmTasks('grunt-contrib-uglify');
		
	//task
	grunt.registerTask('default', ['uglify']);
}
