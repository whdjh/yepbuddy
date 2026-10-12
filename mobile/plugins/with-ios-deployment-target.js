const { withPodfile } = require("@expo/config-plugins")
const { mergeContents } = require("@expo/config-plugins/build/utils/generateCode")

module.exports = function withIosDeploymentTarget(config) {
  return withPodfile(config, (config) => {
    // CocoaPods는 앱의 platform 값보다 낮은 개별 podspec 최소 버전을 유지한다.
    config.modResults.contents = mergeContents({
      tag: "yepbuddy-ios-deployment-target",
      src: config.modResults.contents,
      newSrc: `    if podfile_properties['ios.deploymentTarget']
      minimum = Gem::Version.new(podfile_properties['ios.deploymentTarget'])
      installer.pods_project.targets.each do |target|
        target.build_configurations.each do |configuration|
          current = configuration.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
          if current.nil? || Gem::Version.new(current) < minimum
            configuration.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = minimum.to_s
          end
        end
      end
    end`,
      anchor: /post_install do \|installer\|/,
      offset: 1,
      comment: "#",
    }).contents
    return config
  })
}
