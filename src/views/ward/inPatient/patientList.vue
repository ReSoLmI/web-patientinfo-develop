<template>
	<div id="patientList">
		<div class="am-page-rcont">
			<div class="am-hbox">
				<div class="am-condition-filter am-nmtlr-20" id="conditionList">
					<div class="filter-multi" style="display:none;" v-show="conditionList.defaultDict||conditionList.otherDict">
						<div class="filter-multi-inner">
							<a class="filter-more" v-if="properCode_F!='focus'" @click="showMoreMenu(true)" style="display:none;">显示更多<i class="am-angle am-ml-5"></i></a>
							<!-- 已设定默认菜单展示区域（一级菜单） start -->
							<div class="item">
								<div :class="getDefaultDictClass(conditionList.defaultDict)">
									<a v-for="parent in conditionList.defaultDict" :key="parent.id" @click="queryPatientByCondition(parent.properCode,1)" v-if="isDefaultMenu(parent.properCode) > -1" :class="{'active':parent.properCode==properCode_F}">
                    {{parent.properName}}
                    <span style="display: inline-block;min-width: 20px;">{{parent.count}}</span>
                  </a>
								</div>
							</div>
							<!-- 已设定默认菜单展示区域（一级菜单） end -->
							<i class="item-line"></i>

							<!-- 其余默认菜单展示区域(非焦点模式时展示 二级菜单) start -->
							<div v-show="properCode_F!='focus'" class="item" v-for="parent in conditionList.defaultDict" :key="parent.id" v-if="isDefaultMenu(parent.properCode) == -1" :class="{'item-link':parent.sun.length==0,'active':parent.properCode==properCode_S&&parent.sun.length==0}">
								<a v-if="parent.sun.length==0" @click="queryPatientByCondition(parent.properCode,2)">{{parent.properName}} {{parent.count}}</a>
								<div v-if="parent.sun.length>0" class="am-ctr-sel filter-sel" :class="{'active':parent.properCode==properCode_S&&parent.sun.length>0}">
									<a class="caption" href="javascript:void(0)" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true">
										<div class="li-inner">{{parent.properName}}</div>
									</a>
									<div class="am-dropdown">
										<ul>
											<li v-for="son in parent.sun" :key="son.id" :class="{'active':properCode_T==son.properCode}" @click="queryPatientByCondition(son.properCode,3,parent,son)">
                        <a>
													<div class="li-inner">{{son.properName}} <span class="num">{{son.count || 0}}</span></div>
												</a>
                      </li>
										</ul>
									</div>
								</div>
							</div>
							<!-- 其余默认菜单展示区域(非焦点模式时展示 二级菜单) end -->

							<!-- 其余菜单展示区域(非焦点模式时展示) start -->
							<div v-show="properCode_F!='focus'" class="item" v-for="parent in conditionList.otherDict" :key="parent.id" :class="{'item-link':parent.sun.length==0,'active':parent.properCode==properCode_S&&parent.sun.length==0}">
								<a v-if="parent.sun.length==0" @click="queryPatientByCondition(parent.properCode,2)">{{parent.properName}} {{parent.count}}</a>
								<div v-if="parent.sun.length>0" class="am-ctr-sel filter-sel" :class="{'active':parent.properCode==properCode_S&&parent.sun.length>0}">
								<a class="caption" href="javascript:void(0)" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="true">
										<div class="li-inner">{{parent.properName}}<span class="num">{{parent.count}}</span></div>
									</a>
									<div class="am-dropdown">
										<ul>
											<li v-for="son in parent.sun" :key="son.id" :class="{'active':properCode_T==son.properCode}" @click="queryPatientByCondition(son.properCode,3,parent,son)"><a>
													<div class="li-inner">{{son.properName}} <span class="num">{{son.count}}</span></div>
												</a></li>
										</ul>
									</div>
								</div>
							</div>
							<!-- 其余菜单展示区域(非焦点模式时展示) end -->
						</div>

						<!-- 关键字搜索 start -->
						<div class="am-search-absolute" :class="{'active':isShowSearch}">
							<div class="inner">
								<i class="am-i-search"></i>
								<input type="text" class="input-text" v-model="keyWord_pat" placeholder="床号/姓名/病案号" /><i class="i-search"></i>
								<a class="cancel" @click="hideSearch()">取消</a>
							</div>
						</div>
						<!-- 关键字搜索 end -->
					</div>
					<!-- 快捷菜单 start -->
					<div class="right" v-show="!isShowSearch">
						<a class="btn-tool-search" v-if="properCode_F!='focus'" @click="showSearch()" title="搜索病人"></a>
						<a class="btn-tool-grid" v-if="listType=='grid'&&properCode_F!='focus'" @click="changeListType('list')" title="卡片模式"></a>
						<a class="btn-tool-list" v-if="listType=='list'&&properCode_F!='focus'" @click="changeListType('grid')" title="列表模式"></a>
						<a class="btn-tool-refresh" @click="refresh()" title="刷新"></a>
					</div>
					<!-- 快捷菜单 end -->
				</div>
				<a class="am-btn am-btn-plain-primary am-mt-10 myPatientsBtn" @click="addMyPatientPop()" v-if="loading==1&&properCode_F=='myPatients'">选择我的患者</a>

				<div class="am-tb-fixed-hd am-tb-fixed-hd1" :class="{'am-mt-10':properCode_F=='myPatients','am-mt-20':properCode_F!='myPatients'}" v-show="loading==1&&listType=='list'">
					<table class="am-tb am-tb-layout am-tb-sort">
						<colgroup>
							<col style="width: 70px;">
							<col style="width: 100px;">
							<col style="width: 100px;">
							<col style="width: 70px;">
							<col style="width: 100px;">
							<col style="width: 100px;">
							<col style="width: 150px;">
							<col style="width: 90px;">
							<col style="width: 250px;">
							<col style="width: 100px;">
							<col style="width: 100px;">
							<col style="width: 100px;">
							<col style="width: 150px;">
							<col style="width: 200px;">
						</colgroup>
						<thead>
							<tr>
								<th>床位
									<div class="am-sort">
										<i class="up" :class="{'active':listSort.sort=='ASC'&&listSort.column=='bedNo'}" @click="$listSort('bedNo')"></i>
										<i class="down" :class="{'active':listSort.sort=='DESC'&&listSort.column=='bedNo'}" @click="$listSort('bedNo')"></i>
									</div>
								</th>
								<th>姓名</th>
								<th>住院号</th>
								<th>性别
									<div class="am-sort">
										<i class="up" :class="{'active':listSort.sort=='ASC'&&listSort.column=='physiSexCode'}" @click="$listSort('physiSexCode')"></i>
										<i class="down" :class="{'active':listSort.sort=='DESC'&&listSort.column=='physiSexCode'}" @click="$listSort('physiSexCode')"></i>
									</div>
								</th>
								<th>年龄</th>
								<th>护理等级
									<div class="am-sort">
										<i class="up" :class="{'active':listSort.sort=='ASC'&&listSort.column=='nursingClass'}" @click="$listSort('nursingClass')"></i>
										<i class="down" :class="{'active':listSort.sort=='DESC'&&listSort.column=='nursingClass'}" @click="$listSort('nursingClass')"></i>
									</div>
								</th>
								<th>入院时间
									<div class="am-sort">
										<i class="up" :class="{'active':listSort.sort=='ASC'&&listSort.column=='admissionTime'}" @click="$listSort('admissionTime')"></i>
										<i class="down" :class="{'active':listSort.sort=='DESC'&&listSort.column=='admissionTime'}" @click="$listSort('admissionTime')"></i>
									</div>
								</th>
								<th>主治医生</th>
								<th>过敏史</th>
								<th>医保费别</th>
								<th>预交款项</th>
								<th>费用合计</th>
								<th>联系电话</th>
								<th>诊断</th>
							</tr>
						</thead>
					</table>
				</div>

				<div class="scrollbar-after-condition" :class="{'top90':listType=='grid'&&properCode_F=='myPatients','top110':listType=='list'&&properCode_F!='myPatients','top140':listType=='list'&&properCode_F=='myPatients','scrollbar-after-condition-tb':listType=='list'}" @scroll="pages($event)">
					<!-- 卡片模式列表 start -->
					<div class="am-card-list elemContainer" id="patients_list" v-if="loading==1&&listType=='grid'" style="padding-top:0;">
						<div v-if="paList.length>0" class="clearfix">
							<div class="iteration-card-list" style="padding-top:0px;" v-if="properCode_F!='focus'">
								<div class="iteration-card" :class="showNursingClass(item.nursingClass,0).className" v-for="(item,index) in paList" :key="index" @click="goTo(item, $event)">
									<div class="inner">
										<div class="sign-num" data-tooltip="true" v-if="isShowEnr&&item.focusProperList&&item.focusProperList.length>0">
                      <span v-if="item.focusProperList.length<=99">{{item.focusProperList.length}}</span>
                      <span v-if="item.focusProperList.length>99">99+</span>
											<span class="focusList" style="display: none;">
												<p class='p-tooltip' v-for="(focus,index) in item.focusProperList" :key="index">{{focus.catalogueName}}</p>
											</span>
										</div>
										<i class="i-print-active flag-print showTip" :pNo="item.patIndexNo" title="腕带打印" v-if="isShowWristBand && (!item.printed||item.printed==0)" @click.stop="wristPrint(item.patIndexNo)"></i>
										<h3>{{item.bedNo}}</h3>
										<div class="isolate-orders">
											<span class="am-txt-danger" style="font-weight:bold;" v-if="item.isolateOrders.length > 0">隔离</span>
											<div data-tooltip="view" style="display: none;">
												<div class="p-tooltip am-mt-5" v-for="(iso,index) in item.isolateOrders" :key="index" :style="{color:iso.color}">{{iso.logogram}}</div>
											</div>
										</div>
										<div>
											<div class="name more" data-tooltip="true" style="overflow:hidden;">
												<span>{{item.name}}</span>
												<div class="card-more-details-con" style="display: none;">
													<div class="card-more-details">
														<div class="inner">
															<table>
																<tbody>
																	<tr>
																		<th>入院时间</th>
																		<td>{{ item.admissionTime | date("yyyy-MM-dd hh:mm")}}<i class="badge-text-sm am-ml-5">{{showInDays(item.admissionTime)}}天</i></td>
																	</tr>
																	<tr>
																		<th>临床科室</th>
																		<td>{{item.wardName||'--'}}</td>
																	</tr>
																	<tr>
																		<th>主治医生</th>
																		<td>{{item.attendDrName||'--'}}</td>
																	</tr>
																	<tr>
																		<th>过 敏 史</th>
																		<td>{{item.allergy||'--'}}</td>
																	</tr>
																	<tr>
																		<th>医保费别</th>
																		<td>{{item.chargeTypeName||'--'}}</td>
																	</tr>
																	<tr>
																		<th>预交款项</th>
																		<td>{{item.prePayment | number(2)}}</td>
																	</tr>
																	<tr>
																		<th>费用合计</th>
																		<td>{{item.totalCost | number(2)}}</td>
																	</tr>
																	<tr>
																		<th>联系电话</th>
																		<td>{{item.mobileNo || '--'}}</td>
																	</tr>
																	<tr>
																		<th>诊 断</th>
																		<td>{{item.diagnosis|| '--'}}</td>
																	</tr>
																	<tr>
																		<th>饮 食</th>
																		<td>{{item.diet||'--'}}</td>
																	</tr>
																</tbody>
															</table>
															<div class="more-ft" v-if="isShowEnr">
																<a :data-patindexno="item.patIndexNo" data-url="firstEva" v-if="item.firstAssessment!=='0'"><img src="../../../common/images/inPatient/i-card-assess.png">首次评估</a>
																<a :data-patindexno="item.patIndexNo" data-url="addEva" v-if="item.firstAssessment==='0'"><img src="../../../common/images/inPatient/i-card-assess.png">立即评估</a>
                                <a :data-patindexno="item.patIndexNo" data-url="workListPat" v-if="item.firstAssessment==='0'"><img src="../../../common/images/inPatient/i-card-list.png">工作清单</a>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
										<div class="h3-small">
											<div class="am-flex-item">
												<span class="mrn am-flex-title showTip" data-tooltip="true" m:title="item.displayId">{{item.displayId}}</span>
												<span class="am-flex-after">
													<i>|</i>{{showSex(item.physiSexCode).name}}
												</span>
												<span class="am-flex-after">
													<i>|</i>{{item.ageHis | calculateAge }}
												</span>
											</div>
										</div>
										<div class="bd">
											<div class="txt-type-list">
												<span data-tooltip="true" v-for="(proper,index) in item.propers" :key="index" v-if="proper.logogram" :title="proper.properName" class="showTip txt-type-list-span" :style="{color:proper.color}">{{proper.logogram}}</span>
												<div class="am-angle-r" data-tooltip="true">
													<div data-tooltip="view" style="display: none;">
														<div class="txt-type-list">
															<span data-tooltip="true" v-for="(proper,index) in item.propers" :key="index" v-if="proper.logogram" :title="proper.properName" class="showTip txt-type-list-span" :style="{color:proper.colo}">{{proper.logogram}}</span>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div v-if="properCode_F=='focus'">
								<div class="am-card am-focus-card am-viewport-flip" v-for="(item,index) in paList" :key="index" @click="goTo(item, $event)">
									<div class="front">
										<div class="hd">
											<!-- <h3>{{item.bedNo}}<span class="am-ml-10">{{item.name}}</span><i ms-attr-class="i-sex {{showSex(item.physiSexCode).className}} showTip" data-tooltip="true" ms-attr-title="showSex(item.physiSexCode).name"></i></h3> -->
											<h3>{{item.bedNo}}<span class="am-ml-10">{{item.name}}</span></h3>
											<div class="h3-small">
												<span class="mrn showTip" data-tooltip="true" :title="item.displayId">{{item.displayId}}</span><i>|</i>{{showSex(item.physiSexCode).name}}<i>|</i>{{item.ageHis | calculateAge }}
												<div class="more" data-tooltip="true" style="overflow:hidden;">
													<div class="card-more-details-con" style="display:none;">
														<div class="card-more-details">
															<div class="inner">
																<table>
																	<tbody>
																		<tr>
																			<th>入院时间</th>
																			<td>{{ item.admissionTime | date("yyyy-MM-dd hh:mm")}}<i class="badge-text-sm am-ml-5">{{showInDays(item.admissionTime)}}天</i></td>
																		</tr>
																		<tr>
																			<th>临床科室</th>
																			<td>{{item.wardName||'--'}}</td>
																		</tr>
																		<tr>
																			<th>主治医生</th>
																			<td>{{item.attendDrName||'--'}}</td>
																		</tr>
																		<tr>
																			<th>过 敏 史</th>
																			<td>{{item.allergy||'--'}}</td>
																		</tr>
																		<tr>
																			<th>医保费别</th>
																			<td>{{item.chargeTypeName||'--'}}</td>
																		</tr>
																		<tr>
																			<th>预交款项</th>
																			<td>{{item.prePayment | number(2)}}</td>
																		</tr>
																		<tr>
																			<th>费用合计</th>
																			<td>{{item.totalCost | number(2)}}</td>
																		</tr>
																		<tr>
																			<th>联系电话</th>
																			<td>{{item.mobileNo || '--'}}</td>
																		</tr>
																		<tr>
																			<th>诊 断</th>
																			<td>{{item.diagnosis|| '--'}}</td>
																		</tr>
																		<tr>
																			<th>饮 食</th>
																			<td>{{item.diet||'--'}}</td>
																		</tr>
																	</tbody>
																</table>
																<div class="more-ft" v-if="isShowEnr">
																	<!-- data-url="http://localhost:88/transfer/iframetest.html" -->
																	<!-- data-url="http://192.168.60.47:5180/#/test_" -->
																	<a :data-ptindexno="item.patIndexNo" data-url="firstEva" v-if="item.firstAssessment!=='0'"><img src="../../../common/images/inPatient/i-card-assess.png">首次评估</a>
																	<a :data-patindexno="item.patIndexNo" data-url="addEva" v-if="item.firstAssessment==='0'"><img src="../../../common/images/inPatient/i-card-assess.png">立即评估</a>
																	<a :data-patindexno="item.patIndexNo" data-url="workListPat" v-if="item.firstAssessment==='0'"><img src="../../../common/images/inPatient/i-card-list.png">工作清单</a>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
										<div class="bd">
											<div class="p-list">
												<p v-for="(focus,index) in item.focusProperList" :key="index"><span class="am-txt-muted">{{index+1}}.</span>{{focus.catalogueName}}</p>
											</div>
										</div>
										<a class="p-more" style="display:none;"></a>
									</div>
									<div class="back">
										<div class="bd-back">
											<p v-for="(focus,index) in item.focusProperList" :key="index"><span class="am-txt-muted">{{index+1}}.</span>{{focus.catalogueName}}</p>
										</div>
										<a class="p-more active"></a>
									</div>
								</div>
							</div>
						</div>
						<div class="no-data no-data-smile no-data-fixed" v-show="loading==1&&paList.length==0&&!isSearch&&!isShowSearch" style="display:none;">
							<div class="img"></div>
							<div class="responsive-txt">
								<div class="txt">
                  <span v-if="properCode_F=='focus'">该科室暂无焦点患者哦~</span>
                  <span v-if="properCode_F=='myPatients'">暂无我的患者, 请先<a class="am-ml-5" @click="addMyPatientPop()">选择我的患者</a></span>
                  <span v-if="properCode_F!=='focus'&&properCode_F!=='myPatients'">该科室暂无患者哦~</span></div>
							</div>
						</div>
						<div class="no-data no-data-search no-data-fixed" v-show="loading==1&&paList.length==0&&(isSearch||isShowSearch)" style="display:none;">
							<div class="img"></div>
							<div class="responsive-txt">
								<div class="txt">没有符合条件的患者哦</div>
							</div>
						</div>
					</div>
					<!-- 卡片模式列表 end -->

					<!-- 表格模式列表 start -->
					<div class="elemContainer" id="patients_grid" v-if="loading==1&&listType=='list'">
						<table class="am-tb bg-white am-tb-layout am-tb-tr-even am-tb-hover am-tb-tr-clickabled tableTbody" v-if="paList.length>0">
							<colgroup>
								<col style="width: 70px;">
								<col style="width: 100px;">
								<col style="width: 100px;">
								<col style="width: 70px;">
								<col style="width: 100px;">
								<col style="width: 100px;">
								<col style="width: 150px;">
								<col style="width: 90px;">
								<col style="width: 250px;">
								<col style="width: 100px;">
								<col style="width: 100px;">
								<col style="width: 100px;">
								<col style="width: 150px;">
								<col style="width: 200px;">
							</colgroup>
							<tbody>
								<tr v-for="(item,index) in paList" :key="index" @click="goTo(item, $event)">
									<td>{{item.bedNo}}</td>
									<td width="70">{{item.name}}</td>
									<td width="70">{{item.displayId}}</td>
									<td width="70">{{showSex(item.physiSexCode).name}}</td>
									<td width="70">{{item.ageHis | calculateAge }}</td>
									<td width="95">
										<span v-if="item.nursingClass=='0'">特级护理</span>
										<span v-if="item.nursingClass=='1'">一级护理</span>
										<span v-if="item.nursingClass=='2'">二级护理</span>
										<span v-if="item.nursingClass=='3'">三级护理</span>
									</td>
									<td width="135">{{ item.admissionTime | date("yyyy-MM-dd hh:mm")}}</td>
									<td width="90">{{item.attendDrName}}</td>
									<td width="135">{{item.allergy}}</td>
									<td width="70">{{item.chargeTypeName}}</td>
									<td width="70">{{item.prePayment | number(2)}}</td>
									<td width="70">{{item.totalCost | number(2)}}</td>
									<td width="95">{{item.mobileNo||'--'}}</td>
									<td width="120">
										<span data-tooltip="true" :title="item.diagnosis" :class="{'has-tip':item.diagnosis!=null&&item.diagnosis.length>15}">
											<span v-if="item.diagnosis==null">--</span>
											<span v-if="item.diagnosis!==null">
												<span v-if="item.diagnosis.length>15">{{item.diagnosis.substr(0,15)}}...</span>
												<span v-if="item.diagnosis.length<15">{{item.diagnosis}}</span>
											</span>
										</span>
									</td>
								</tr>
							</tbody>
						</table>
						<div class="no-data no-data-smile no-data-fixed" v-if="loading==1&&paList.length==0&&!isSearch">
							<div class="img"></div>
							<div class="responsive-txt">
								<!-- <div class="txt">该科室暂无患者哦~</div> -->
								<div class="txt">
                  <span v-if="properCode_F=='focus'">该科室暂无焦点患者哦~</span>
                  <span v-if="properCode_F=='myPatients'">暂无我的患者, 请先<a class="am-ml-5" @click="addMyPatientPop()">选择我的患者</a></span>
                  <span v-if="properCode_F!='focus'&&properCode_F!='myPatients'">该科室暂无患者哦~</span></div>
							</div>
						</div>
						<div class="no-data no-data-search no-data-fixed" v-if="loading==1&&paList.length==0&&isSearch">
							<div class="img"></div>
							<div class="responsive-txt">
								<div class="txt">没有符合条件的患者哦</div>
							</div>
						</div>
						<!-- <div class="ui-page" ms-widget="pager,papList,papList" v-if="paList.length>0"></div> -->
						<!-- <div class="pagination" id="papList" v-if="paList.length>0"></div> -->
					</div>
					<!-- 表格模式列表 end -->

					<div class="card-loading" v-if="isShowLoading">
						<i class="am-spin"></i>正在努力加载中～
					</div>

					<div class="card-loading" v-if="noMoreTips&&paList.length>0&&((listType=='grid'&&papGrid.totalPages>1)||(listType=='list'&&papList.totalPages>1))">
						没有更多患者了哦~
					</div>
				</div>
			</div>
			<div class="loading-data" v-if="loading==0">
				数据加载中....
			</div>

			<!-- 添加我的患者 start -->
			<div id="pop-content-myPatients" style="display: none;">
				<div class="am-pd-20" style="height: 300px;overflow: auto;">
					<ul class="num-rdo-list" v-if="allBeds.length>0 && !loadingBeds">
						<li v-for="(bed,index) in allBeds" :key="index" :class="{'active':bed.selected=='true'}" @click="checkBed(bed, index)"><a>{{bed.bedNo}}</a></li>
					</ul>
					<div class="no-data no-data-search no-data-fixed" v-show="allBeds.length==0 && !loadingBeds" style="display:none;">
						<div class="img"></div>
						<div class="responsive-txt">
							<div class="txt">暂无床位</div>
						</div>
					</div>
					<div class="loading-data" v-if="loadingBeds">
						数据加载中....
					</div>
				</div>
				<div class="change-bed-ft">
					<div class="btn-switch am-mr-10" :class="{'active':allBeds.length>0&&allBeds.length==selectBeds.length}" @click="checkAllBed()"><span></span></div>全选患者
					<div class="right">
						已选：{{selectBeds.length}}<a class="am-btn-confirm am-ml-20" style="margin-top: -3px;" @click="addMyBed()">确定</a>
					</div>
				</div>
			</div>
			<!-- 添加我的患者 end -->
		</div>
	</div>
</template>

<script>
// import moment from 'moment'
import event from '../../../common/js/event'
import common from '../../../common/js/common'
export default {
  name: '',
  data () {
    return {
      wardCode: this.common.getUrlParam('wardCode'), // 科室code
      organCode: this.common.getOrganCode(), // 组织机构码
      conditionList: {}, // 筛选条件
      listType: 'grid', // 列表格式 默认是网格
      oldListType: 'grid', // 列表格式 用于焦点患者菜单切换 主要规则：选中焦点患者时，只能展示卡片模式，选中其他菜单时，需要默认展示上次展示模式
      isSearch: false, // 当前是否为搜索模式
      paList: [], // 病人列表
      properCode_F: '', // 一级菜单
      properCode_S: '', // 二级菜单
      properCode_T: '', // 三级菜单
      nursingClass: '', // 护理等级
      oldMenuName: '', // 上次选中菜单名称，主要用于二级菜单名称控制
      printTemplete: {}, // 腕带打印模板
      listSort: {column: 'bedNo', sort: 'ASC'}, // 排序信息

      isShowLoading: false, // 是否展示病人列表加载下一页提示
      // isShowMore:false,
      noMoreTips: false, // 是否展示没有更多数据提示
      canLoad: true, // 是否能加载
      loading: 0, // 界面加载中展示标志 0-展示
      // 卡片模式分页数据
      papGrid: {
        ele: '#papGrid', // 分页元素
        totalItems: 0, // 总数据
        currentPage: 1, // 当前页
        items_per_page: 50, // 每页展示数据
        totalPages: 0 // 总页数
      },
      // 表格模式分页数据
      papList: {
        ele: '#papList', // 分页元素
        totalItems: 0, // 总数据
        currentPage: 1, // 当前页
        items_per_page: 50, // 每页展示数据
        totalPages: 0 // 总页数
      },

      isShowEnr: false, // 是否展示enr数据
      keyWord_pat: '', // 搜索关键词
      // 搜索前数据信息 主要规则：取消搜索后需要恢复搜索前数据
      searchBefore: {
        isSearch: false, // 是否处于菜单筛选模式
        currentPage: 1, // 当前页码
        column: 'bedNo', // 排序字段
        sort: 'ASC', // 排序顺序
        properCode_F: '', // 选中的一级菜单code
        properCode_S: '', // 选中的二级菜单code
        properCode_T: '' // 选中的三级菜单code
      },
      isShowSearch: false, // 是否展示搜索

      defaultMenuCode: ['myPatients', 'focus', 'all'], // 默认展示菜单code
      loadingBeds: true, // 加载床位标志
      allBeds: [], // 全部床位列表
      selectBeds: [], // 选中床位列表
      properCodeList: [], // 菜单code列表
      isolateOrdersCode: [], // 隔离医嘱code
      defaultPropersCode: ['0', '1', '2', '3', 'newOrders'], // 默认菜单code
      timeInfo: {},
      isShowWristBand: false, // 是否启用腕带打印功能
      timeout: '',
      timeInterval: '',
      baseUrl: '/patientinfoPC/'
    }
  },
  filters: {
    date (value, format) {
      return new Date(value).format(format)
    },
    calculateAge (value) {
      return common.calculateAge(value).age
    },
    number (value, size) {
      if (value) {
        return value.toFixed(size)
      } else {
        var number = 0
        return number.toFixed(size)
      }
    }
  },
  watch: {
    keyWord_pat (newValue, oldValue) {
      // 关键字不为空且去空格后变化后值和变化前不相同时在进行数据搜索处理
      if ($.trim(this.keyWord_pat) && $.trim(newValue) !== $.trim(oldValue)) {
        // 判断是否已经处于关键字搜索模式 若还未处于搜索模式 记录进入搜索模式前筛选条件数据信息 用于取消搜索模式后数据按原来筛选条件恢复查询
        if (!this.searchBefore.isSearch) {
          this.searchBefore.properCode = this.properCode_S
          this.searchBefore.properCode_T = this.properCode_T
          if (this.listType === 'grid') {
            this.searchBefore.currentPage = this.papGrid.currentPage
          } else {
            this.searchBefore.currentPage = this.papList.currentPage
            this.searchBefore.column = this.listSort.column
            this.searchBefore.sort = this.listSort.sort
          }
        }
        // 进入关键字搜索模式
        this.searchBefore.isSearch = true
        // 默认按照床号升序排序
        this.listSort = {column: 'bedNo', sort: 'ASC'}
        this.common.removeLocalStorage(['PAT_patientSortCol', 'PAT_patientSort'])
        // 查询病人
        this.queryPatients(1)
      } else if (!$.trim(this.keyWord_pat)) { // 搜索关键字为空时 恢复进入搜索前数据
        if (this.listType === 'grid') {
          this.papGrid.currentPage = this.searchBefore.currentPage
        } else {
          this.papList.currentPage = this.searchBefore.currentPage
          this.listSort.column = this.searchBefore.column
          this.listSort.sort = this.searchBefore.sort
          this.common.setLocalStorage('PAT_patientSortCol', this.searchBefore.column)
          this.common.setLocalStorage('PAT_patientSort', this.searchBefore.sort)
        }
        // 取消进入搜索模式
        this.searchBefore.isSearch = false
        // 查询病人
        this.queryPatients(1)
      }
    }
  },
  created () {
    this.init()
  },
  mounted () {
    var that = this
    window.addEventListener('message', function (e) {
      if (typeof (e.data) === 'string') {
        that.wardCode = e.data
        that.queryConditions()
      }
    }, false)
  },
  methods: {
    init: function () {
      this.loading = 0
      this.hideSearch()
      // 记录当前pageFrom、 transPage、transLogoutFun参数
      this.common.setLocalStorage('PAT_pageFrom', this.common.getUrlParam('pageFrom'))
      this.common.setLocalStorage('PAT_transPage', this.common.getUrlParam('transPage'))
      this.common.setLocalStorage('PAT_transFun', this.common.getUrlParam('transLogoutFun'))

      // 默认从cookie中取菜单相关数据 主要为了解决界面跳转再返回当前页时选中跳转前菜单数据
      this.wardCode = this.common.getUrlParam('wardCode')
      this.listType = this.common.getLocalStorage('PAT_patientListType') || 'grid'
      this.oldListType = this.common.getLocalStorage('PAT_patientListType') || 'grid'
      this.properCode_F = this.common.getLocalStorage('PAT_properCode_F')
      this.properCode_S = this.common.getLocalStorage('PAT_properCode_S')
      this.properCode_T = this.common.getLocalStorage('PAT_properCode_T')
      this.listSort = {column: this.common.getLocalStorage('PAT_patientSortCol') || 'bedNo', sort: this.common.getLocalStorage('PAT_patientSort') || 'ASC'}

      // 选中非一级菜单时认为处于菜单筛选模式
      if (this.properCode_S) {
        this.isSearch = true
      } else {
        this.isSearch = false
      }

      this.common.queryRuleList(['newPatient', 'newOrder'], (ruleList) => {
        this.timeInfo = this.common.queryTimeCondition(ruleList)
        // 查询筛选条件列表
        this.queryConditions()
      })
      // 获取常量配置-enr是否接入患者信息列表
      this.isShowEnr = false
      this.common.queryConstants(['ENR_ACCESS_PATIENT', 'WRIST_BAND_PRINT'], true, function (data) {
        // enr是否接入患者信息列表
        if (data && data.ENR_ACCESS_PATIENT && data.ENR_ACCESS_PATIENT.length > 0) {
          if (Number(data.ENR_ACCESS_PATIENT[0].constantValue && data.ENR_ACCESS_PATIENT[0].constantValue) === 1) {
            this.isShowEnr = true
          }
        }
        // 是否开启腕带打印入口
        if (data && data.WRIST_BAND_PRINT && data.WRIST_BAND_PRINT.length > 0) {
          if (Number(data.WRIST_BAND_PRINT[0].constantValue && data.WRIST_BAND_PRINT[0].constantValue) === 1) {
            this.isShowWristBand = true
          }
        }
      })
    },
    // 查询菜单列表
    queryConditions: function () {
      var that = this
      var param = {
        'organCode': this.organCode,
        'wardCode': this.wardCode,
        'status': 'in',
        // 医嘱查询开始时间 该字段用来查是否有新医嘱
        'enterBeginTime': this.timeInfo.enterBeginTime,
        // 入院查询开始时间 该字段用来查询是否为新病人
        'admissionBeginTime': this.timeInfo.admissionBeginTime,
        // 查询结束时间 默认为当前系统时间
        'endTime': this.timeInfo.endTime,
        'patientType': ''
      }
      // 当前选中我的患者时 patientType参数为MP
      if (this.properCode_F === 'myPatients' || !this.properCode_F) {
        param.patientType = 'MP'
      }
      this.common.ajax({
        url: 'patientinfo-service/patients/v2/menu',
        dataType: 'json',
        type: 'get',
        timeout: 60000,
        data: param,
        callback: function (data) {
          // 默认清空菜单code 后续需要收集所有菜单code 用于后续查询对应菜单count时用
          that.properCodeList = []
          if (data.otherDict) {
            // 如果有二级菜单，则把一级菜单数据添加到二级菜单列表第一位
            for (var i = 0; i < data.otherDict.length; i++) {
              that.properCodeList.push(data.otherDict[i].properCode)
              if (data.otherDict[i].sun && data.otherDict[i].sun.length > 0) {
                var menu = {
                  count: data.otherDict[i].count,
                  id: data.otherDict[i].id,
                  organCode: data.otherDict[i].organCode,
                  parentNode: data.otherDict[i].parentNode,
                  properCode: data.otherDict[i].properCode,
                  properName: data.otherDict[i].properName,
                  sort: data.otherDict[i].sort
                }
                data.otherDict[i].sun.unshift(menu)
                // 收集其他类型菜单code
                for (var k = 0; k < data.otherDict[i].sun.length; k++) {
                  if (that.properCodeList.indexOf(data.otherDict[i].sun[k].properCode) === -1) {
                    that.properCodeList.push(data.otherDict[i].sun[k].properCode)
                  }
                }
              }
            }
          }
          that.conditionList = data
          // 菜单列表中是否包含全部患者
          var isHaveAllpatients = false
          if (data.defaultDict) {
            for (var j = 0; j < data.defaultDict.length; j++) {
              // 菜单列表中含有all properCode时 认为含有全部患者菜单
              if (data.defaultDict[j].properCode === 'all') {
                isHaveAllpatients = true
              }
              // 收集默认菜单code
              if (that.properCodeList.indexOf(data.defaultDict[j].properCode) === -1) {
                that.properCodeList.push(data.defaultDict[j].properCode)
              }
              // 收集除护理等级外的其他三级菜单的code
              if (data.defaultDict[j].properCode !== 'nursingClass' && data.defaultDict[j].sun && data.defaultDict[j].sun.length > 0) {
                for (var m = 0; m < data.defaultDict[j].sun.length; m++) {
                  if (that.properCodeList.indexOf(data.defaultDict[j].sun[m].properCode) === -1) {
                    that.properCodeList.push(data.defaultDict[j].sun[m].properCode)
                  }
                }
              }
              // 收集隔离医嘱code值 用于病人展示时 特殊展示隔离医嘱
              if (data.defaultDict[j].properCode === 'isolationOrders' && data.defaultDict[j].sun && data.defaultDict[j].sun.length > 0) {
                for (var h = 0; h < data.defaultDict[j].sun.length; h++) {
                  // console.log(that.isolateOrdersCode)
                  that.isolateOrdersCode.push(data.defaultDict[j].sun[h].properCode)
                }
              }
            }
          }
          that.$nextTick(function () {
            $('#conditionList').fadeIn()
            // 当前未选中菜单时 菜单列表中包含全部患者时 默认选择全部患者菜单 否则默认选择第一个菜单
            if (!that.properCode_F) {
              if (isHaveAllpatients) {
                that.properCode_F = 'all'
              } else {
                that.properCode_F = that.conditionList.defaultDict[0].properCode
              }
            } else {
              // 当前有选中菜单且有选中二级菜单时处理
              var activeDom = $('#conditionList .item>.filter-sel.active')
              if (activeDom.length > 0) {
                // 当前选中二级菜单为护理等级时 将三级菜单code赋值给nursingClass字段
                if (that.properCode_S === 'nursingClass') {
                  that.nursingClass = that.properCode_T
                }
              }
            }
            // 查询菜单对应数量
            that.queryMenuCount()
            // 查询患者列表
            that.queryPatients(1)
            // 判断是否需要展示 展示更多 按钮
            that.isShowMoreMenu()
            $(window).resize(function () {
              that.isShowMoreMenu()
            })
          })
        }
      })
    },
    // 查询菜单数量
    queryMenuCount: function () {
      var that = this
      var param = {
        'organCode': this.organCode,
        'wardCode': this.wardCode,
        'status': 'in',
        // 医嘱查询开始时间 该字段用来查是否有新医嘱
        'enterBeginTime': this.timeInfo.enterBeginTime,
        // 入院查询开始时间 该字段用来查询是否为新病人
        'admissionBeginTime': this.timeInfo.admissionBeginTime,
        // 查询结束时间 默认为当前系统时间
        'endTime': this.timeInfo.endTime,
        'patientType': '',
        'properCodeList': this.properCodeList
      }
      // 当前选中我的患者时 patientType参数为MP
      if (this.properCode_F === 'myPatients' || !this.properCode_F) {
        param.patientType = 'MP'
      }
      this.common.ajax({
        url: 'patientinfo-service/patients/v2/menu/count',
        dataType: 'json',
        type: 'post',
        timeout: 60000,
        data: JSON.stringify(param),
        callback: function (data) {
          // 循环给各菜单赋值对应的count值
          if (data && data.length > 0) {
            for (var m = 0; m < data.length; m++) {
              for (var n = 0; n < that.conditionList.defaultDict.length; n++) {
                if (data[m].properCode === that.conditionList.defaultDict[n].properCode) {
                  that.conditionList.defaultDict[n].count = data[m].count
                }
                if (that.conditionList.defaultDict[n].sun && that.conditionList.defaultDict[n].sun.length) {
                  for (var k = 0; k < that.conditionList.defaultDict[n].sun.length; k++) {
                    if (data[m].properCode === that.conditionList.defaultDict[n].sun[k].properCode) {
                      that.conditionList.defaultDict[n].sun[k].count = data[m].count
                      break
                    }
                  }
                }
              }
              for (var o = 0; o < that.conditionList.otherDict.length; o++) {
                if (data[m].properCode === that.conditionList.otherDict[o].properCode) {
                  that.conditionList.otherDict[o].count = data[m].count
                }
                if (that.conditionList.otherDict[o].sun && that.conditionList.otherDict[o].sun.length) {
                  for (var j = 0; j < that.conditionList.otherDict[o].sun.length; j++) {
                    if (data[m].properCode === that.conditionList.otherDict[o].sun[j].properCode) {
                      that.conditionList.otherDict[o].sun[j].count = data[m].count
                      break
                    }
                  }
                }
              }
            }
          }

          that.$nextTick(function () {
            // 存储当前二级菜单 点击其余菜单时 默认需要恢复展示上次选中二级菜单名称
            that.oldMenuName = $('#conditionList .item>.filter-sel.active a.caption').find('.li-inner').html()
            // console.log("222--" + that.oldMenuName)
            // 取出当前选中三级菜单的展示内容 赋值给其父类展示
            var text = $('#conditionList .item>.filter-sel.active li.active>a>.li-inner').html()
            $('#conditionList .item>.filter-sel.active>a>.li-inner').html(text)

            // 判断是否需要展示 展示更多 按钮
            that.isShowMoreMenu()
            $(window).resize(function () {
              that.isShowMoreMenu()
            })
          })
        }
      })
    },
    // 是否展示 显示更多菜单 按钮
    isShowMoreMenu: function () {
      // 菜单展示区域默认只展示一行菜单 通过判断菜单展示区域是否超过一行（一行菜单高度为40）超过一行时 展示更多按钮
      var menuHeight = $('.filter-multi>.filter-multi-inner').height()
      if (menuHeight > 40) {
        $('.filter-more').show()
      } else {
        $('.filter-more').hide()
      }
    },
    /**
     * 通过筛选条件查询患者列表
     * @param properCode 当前点击菜单code
     * @param type 1:代表一级菜单 2:代表二级菜单 3:代表三级菜单
     * @param parent 父类菜单信息 只有当前菜单为三级菜单时才传入此参数
     * @param son 当前菜单信息 只有当前菜单为三级菜单时才传入此参数
     */
    queryPatientByCondition: function (properCode, type, parent, son) {
      // 当前菜单为护理等级时 只展开二级菜单 不进行后续处理
      if (properCode === 'nursingClass' && Number(type) === 2) {
        return
      }

      this.loading = 0

      this.canLoad = false
      this.noMoreTips = false

      // 初始化排序信息
      this.listSort = {column: 'bedNo', sort: 'ASC'}
      this.common.removeLocalStorage(['PAT_patientSortCol', 'PAT_patientSort'])
      // 焦点患者只有卡片模式，不可切换至列表模式
      if (properCode === 'focus') {
        this.oldListType = this.listType
        this.listType = 'grid'
      } else if (this.properCode_S === 'focus') {
        this.listType = this.oldListType
      }

      // 当前只选中一级菜单时 处于非菜单筛选模式
      if (this.isDefaultMenu(properCode) > -1 && !this.properCode_S) {
        this.isSearch = false
      } else {
        this.isSearch = true
      }
      // 当前点击为一级菜单时
      if (type === 1) {
        // if (this.properCode_F !== properCode) {
        // 清空二级三级菜单选择
        $('#conditionList .item>.filter-sel.active>a>.li-inner').html(this.oldMenuName)
        this.properCode_S = ''
        this.properCode_T = ''
        this.oldMenuName = ''
        // }
        $('.myPatientsBtn').removeAttr('style')
        $('.am-tb-fixed-hd').removeAttr('style')
        $('.scrollbar-after-condition').removeAttr('style')
        $('.filter-more').removeClass('active')
        $('.filter-multi-active').removeClass('filter-multi-active')
        this.properCode_F = properCode
      } else if (Number(type) === 2 && (!parent || !parent.sun || parent.sun.length === 0)) { // 当前点击二级菜单没有三级菜单时
        // 如果当前菜单未被选中时 选中该菜单并执行相关处理 如果当前菜单已被选中，取消选中该菜单
        if (properCode !== this.properCode_S) {
          // 上一次选中三级菜单的父类还原为默认展示值
          if (this.oldMenuName) {
            $('#conditionList .item>.filter-sel.active>a>.li-inner').html(this.oldMenuName)
            this.oldMenuName = ''
          }

          this.properCode_S = properCode
        } else {
          this.properCode_S = ''
        }
        this.properCode_T = ''
      } else if (Number(type) === 2 && parent && parent.sun && parent.sun.length > 0) { // 当前点击二级菜单有三级菜单时
        // 默认选中第一个三级菜单
        if (!this.properCode_T || this.properCode_S !== properCode) {
          // 上一次选中三级菜单的父类还原为默认展示值
          if (this.oldMenuName) {
            $('#conditionList .item>.filter-sel.active>a>.li-inner').html(this.oldMenuName)
            this.oldMenuName = ''
          }
          this.properCode_S = properCode
          this.properCode_T = properCode
        }
      } else if (Number(type) === 3) { // 当前点击为三级菜单时
        // 如果当前菜单未被选中时 选中该菜单并执行相关处理 如果当前菜单已被选中，取消选中该菜单
        if (properCode !== this.properCode_T) {
          // 记住当前选中三级菜单的父类的默认展示值
          if (!this.oldMenuName) {
            var text = $(event.currentTarget).parent().parent().prev('a').find('.li-inner').html()
            this.oldMenuName = text
            // console.log("111--" + this.oldMenuName)
          } else {
            $('#conditionList .item>.filter-sel.active>a>.li-inner').html(this.oldMenuName)
            this.oldMenuName = ''
            var text1 = $(event.currentTarget).parent().parent().prev('a').find('.li-inner').html()
            this.oldMenuName = text1
          }

          this.properCode_T = properCode
          this.properCode_S = parent.properCode
          // 切换当前选中三级菜单的父类的展示值
          $(event.currentTarget).parent().parent().prev('a').find('.li-inner').html(son.properName + '<span class="num">' + (son.count || 0) + '</span>')
        } else {
          $('#conditionList .item>.filter-sel.active>a>.li-inner').html(this.oldMenuName)
          this.properCode_S = ''
          this.properCode_T = ''
        }
      }

      // 记住当前菜单选择 刷新界面或者再次回到该界面时 选择上次菜单选项
      this.common.setLocalStorage('PAT_properCode_F', this.properCode_F)
      this.common.setLocalStorage('PAT_properCode_S', this.properCode_S)
      this.common.setLocalStorage('PAT_properCode_T', this.properCode_T)

      // 因为只有一级菜单为全部患者或者我的患者时 才展示对应的二级菜单 所以只有这两个时 才需要查询对应的菜单数量
      if (properCode === 'all' || properCode === 'myPatients') {
        this.queryMenuCount()
      }

      if (this.properCode_S === 'nursingClass') {
        this.nursingClass = properCode
      } else {
        this.nursingClass = ''
      }
      setTimeout(() => {
        this.queryPatients(1)
      }, 10)
    },
    /**
     * 查询患者
     * @param {number} isShowPageOne 是否展示第一页数据
     */
    queryPatients: function (isShowPageOne) {
      if (this.papGrid.currentPage === 0 || this.papList.currentPage === 0) {
        return
      }
      // 当前查询第一页时 对应分页数据的当前页码置为1
      if (isShowPageOne === 1) {
        if (this.listType === 'grid') {
          this.papGrid.currentPage = 1
        } else {
          this.papList.currentPage = 1
        }
      }
      var param = {
        'wardCode': this.wardCode,
        'organCode': this.organCode,
        'status': 'in',
        // 医嘱查询开始时间 该字段用来查是否有新医嘱
        'enterBeginTime': this.timeInfo.enterBeginTime,
        // 入院查询开始时间 该字段用来查询是否为新病人
        'admissionBeginTime': this.timeInfo.admissionBeginTime,
        // 查询结束时间 默认为当前系统时间
        'endTime': this.timeInfo.endTime
      }

      // 卡片模式时 默认按照床号升级排序 否则按照界面选择对应排序
      if (this.listType === 'grid') {
        param.sortField = 'bedNo'
        param.direction = 'ASC'
      } else {
        param.sortField = this.listSort.column
        param.direction = this.listSort.sort
      }

      if (this.properCode_F) {
        // 当前菜单为焦点患者 或者 只选中一级菜单时 properCode参数为一级菜单code
        if (this.properCode_F === 'focus' || !this.properCode_S) {
          param.properCode = this.properCode_F
        } else if (this.properCode_S === 'nursingClass') { // 当前二级菜单code为护理等级时 护理等级参数封装
          param.nursingClass = this.nursingClass
        } else if (this.properCode_T) { // 当前选中三级菜单时 properCode参数为三级菜单code
          param.properCode = this.properCode_T
        } else if (this.properCode_S) { // 当前选中二级菜单时 properCode参数为二级菜单code
          param.properCode = this.properCode_S
        }
      }
      // 当前菜单为我的患者时 patientType参数为MP
      if (this.properCode_F === 'myPatients') {
        param.patientType = 'MP'
      }

      // 根据当前列表展示模式 取对应的分页数据
      if (this.listType === 'grid') {
        param.pageNumber = this.papGrid.currentPage - 1
        param.pageSize = this.papGrid.items_per_page
      } else {
        param.pageNumber = this.papList.currentPage - 1
        param.pageSize = this.papList.items_per_page
      }

      // 搜索关键字参数封装
      var keyWordPat = $.trim(this.keyWord_pat)
      if (keyWordPat) {
        param.strLike = keyWordPat
      }

      var that = this
      this.common.ajax({
        url: 'patientinfo-service/patients/v2/info/page',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: function (data) {
          var list = data.content
          // 病人编号列表
          var patIndexNoList = []
          // 病人对应index值
          var patIndex = {}
          for (var i = 0; i < list.length; i++) {
            // 收集病人列表编号
            patIndexNoList.push(list[i].patIndexNo)
            // 收集当前循环病人index值信息
            patIndex[list[i].patIndexNo] = i
            // 病人对应属性收集
            var propersObj = {}
            // 先收集默认属性
            for (var j = 0; j < list[i].propers.length; j++) {
              propersObj[list[i].propers[j].properCode] = list[i].propers[j]
            }
            // 收集欠费标志属性
            if (list[i].arrearFlag === '1') {
              propersObj['arrearFlag'] = {
                indexNo: null,
                patIndexNo: list[i].patIndexNo,
                properCode: 'arrearFlag',
                properName: '欠费',
                logogram: '欠',
                color: '#FF9F01'
              }
            }
            // list[i].propers= [];
            list[i].propersObj = propersObj
            list[i].focusProperList = list[i].focusProperList ? list[i].focusProperList : []
            // 隔离医嘱
            list[i].isolateOrders = []

            // 姓名处理 中间文字用*替代展示
            // var name = list[i].name
            // var length = name.length - 2
            // if (length < 0) {
            //   name = name.slice(0,1)
            // } else if (length == 0) {
            //   name = name.slice(0,1) + '*'
            // } else {
            //   var prev = name.slice(0,1)
            //   var last = name.slice(name.length-1)
            //   var middle = ''
            //   for (var h = 0; h < length; h++) {
            //     middle += '*'
            //   }
            //   name = prev + middle + last
            // }
            // list[i].name = name
          }
          // console.log(that.isShowLoading)

          if (isShowPageOne === 1) {
            that.paList = []
          }
          // 计算整个病人数组中病人对应index值
          for (var index in patIndex) {
            patIndex[index] += that.paList.length
          }
          that.paList.push.apply(that.paList, list)

          if (that.isShowLoading) {
            that.isShowLoading = false
            that.$nextTick(function () {
              // 控制界面展示
              that.controlPage()
            })
          }

          if (patIndexNoList.length > 0) {
            // 再请求患者属性字段 因为请求患者属性时接口耗时较久 所以现在先请求病人基础数据后再请求对应的属性 提高界面展示响应速度
            that.queryPatientsPropers(param)
            // 请求病人诊断数据
            that.queryPatientsDiagnosis(patIndexNoList, patIndex)
            // 请求病人过敏数据
            that.queryPatientsAllergy(patIndexNoList, patIndex)
          }
          // 处理分页数据
          if (isShowPageOne === 1) {
            if (that.listType === 'grid') {
              that.papGrid.totalItems = data.totalElements
              that.papGrid.totalPages = data.totalPages
            } else {
              that.papList.totalItems = data.totalElements
              that.papList.totalPages = data.totalPages
            }
            setTimeout(function () {
              that.canLoad = true
            }, 100)
          }
          that.$nextTick(function () {
            that.controlPage()
            // that.common.translate();
          })
        }
      })
    },
    /**
     * 查询患者诊断信息
     * @param {array} patIndexNoList 查询病人编号列表
     * @param {object} patIndex 查询病人对应病人列表中index值集合
     */
    queryPatientsDiagnosis: function (patIndexNoList, patIndex) {
      var that = this
      var param = {
        organCode: this.common.getOrganCode(),
        diagTypeCodeList: 6,
        patIndexNoList: patIndexNoList.toString()
      }
      this.common.ajax({
        url: 'baseinfo2.0/inhospdiagnosis/inhospdiagnosis',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: function (data) {
          var diagnosis = {}
          if (data && data.length > 0) {
            // 收集诊断集合数据 病人诊断数据有多条时，用逗号拼接
            data.map(function (patient) {
              if (!diagnosis[patient.patIndexNo]) {
                diagnosis[patient.patIndexNo] = ''
              }
              diagnosis[patient.patIndexNo] += (diagnosis[patient.patIndexNo] ? '，' : '') + patient.diagName
            })
            // console.log(diagnosis)
          }
          // 诊断赋值给对应病人数据
          for (var dia in diagnosis) {
            if (patIndex[dia]) {
              that.paList[patIndex[dia]].diagnosis = diagnosis[dia]
            }
          }
        }
      })
    },
    /**
     * 查询患者过敏信息
     * @param {array} patIndexNoList 查询病人编号列表
     * @param {object} patIndex 查询病人对应病人列表中index值集合
     */
    queryPatientsAllergy: function (patIndexNoList, patIndex) {
      var that = this
      var param = {
        organCode: this.common.getOrganCode(),
        patIndexNoList: patIndexNoList.toString(),
        registerResultCode: 1 // 只查询阳性项
      }
      this.common.ajax({
        url: 'baseinfo2.0/allergy/allergy',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: function (data) {
          var allergy = {}
          if (data && data.length > 0) {
            // 收集诊断集合数据 病人诊断数据有多条时，用逗号拼接
            data.map(function (patient) {
              if (!allergy[patient.patIndexNo]) {
                allergy[patient.patIndexNo] = ''
              }
              allergy[patient.patIndexNo] += (allergy[patient.patIndexNo] ? '，' : '') + patient.allergyName
            })
            // console.log(diagnosis)
          }
          // 过敏赋值给对应病人数据
          for (var dia in allergy) {
            that.paList[patIndex[dia]].allergy = allergy[dia]
            // 收集过敏标志属性
            if (that.paList[patIndex[dia]].allergy) {
              that.paList[patIndex[dia]].propers.push({
                indexNo: null,
                patIndexNo: dia,
                properCode: 'allergy',
                properName: '过敏',
                logogram: '敏',
                color: '#D81DDA'
              })
            }
          }

          that.$nextTick(function () {
            that.controlPage()
          })
        }
      })
    },
    /**
     * 查询病人属性数据
     * @param {object} param 查询参数
     */
    queryPatientsPropers: function (param) {
      var that = this
      that.common.ajax({
        url: 'patientinfo-service/patients/v2/proper',
        dataType: 'json',
        type: 'get',
        data: param,
        callback: function (data) {
          if (data) {
            // 根据当前页码和分页条数 计算当前病人起始index值
            var fromIndex = param.pageNumber * param.pageSize
            that.paList.map(function (patient, index) {
              if (data[patient.patIndexNo]) {
                if (index >= fromIndex) {
                  if (data[patient.patIndexNo].properList) {
                    // 先将原propers字段合并到一起
                    data[patient.patIndexNo].properList.push.apply(data[patient.patIndexNo].properList, patient.propers)
                    // 再将属性值转换为对象存储 用以去重
                    for (var i = 0; i < data[patient.patIndexNo].properList.length; i++) {
                      var proper = data[patient.patIndexNo].properList[i]
                      patient.propersObj[proper.properCode] = proper
                    }
                  }
                  // 再将对象转换为数组赋值
                  var propers = []
                  var isolateOrders = []
                  var defaultPropers = []
                  for (var k in patient.propersObj) {
                    if (that.isolateOrdersCode.indexOf(patient.propersObj[k].properCode) > -1) {
                      isolateOrders.push(patient.propersObj[k])
                    } else if (that.defaultPropersCode.indexOf(patient.propersObj[k].properCode) > -1) {
                      defaultPropers.push(patient.propersObj[k])
                    } else {
                      propers.push(patient.propersObj[k])
                    }
                  }
                  propers.push.apply(propers, defaultPropers)
                  patient.propers = propers
                  patient.isolateOrders = isolateOrders
                  if (data[patient.patIndexNo].focusProperList && data[patient.patIndexNo].focusProperList.length > 0) {
                    patient.focusProperList = data[patient.patIndexNo].focusProperList
                  }
                }
              }
            })

            that.$nextTick(function () {
              that.controlPage()
              // that.common.translate()
            })
          }
        }
      })
    },
    // 能否加载更多数据
    canLoadMore: function () {
      // 列表展示区域元素
      var $this = $('.scrollbar-after-condition')
      var viewH = $this.outerHeight() // 展示区域可见高度
      var contentH = $this.find('.elemContainer').outerHeight() // 列表实际内容高度
      // 列表展示高度未超出滚动区域高度时 继续加载下一页数据 目的是为了使滚动区域出现滚动条 然后才能滚动加载下一页数据
      if (contentH <= viewH) {
        // 卡片模式
        if (this.listType === 'grid') {
          // 页码加1
          this.papGrid.currentPage += 1
          // 如果还未到最后一页 继续加载下一页数据
          if (this.papGrid.currentPage <= this.papGrid.totalPages) {
            this.isShowLoading = true
            this.queryPatients()
          } else {
            // 全部加载完时 提醒数据已加载完
            this.noMoreTips = true
            // this.isShowMore=false;
            // 三秒后提示自动消失
            this.timeout = setTimeout(() => {
              this.canLoad = false
              this.noMoreTips = false
              return false
            }, 3000)
          }
        } else { // 列表模式
          // 页码加1
          this.papList.currentPage += 1
          // 如果还未到最后一页 继续加载下一页数据
          if (this.papList.currentPage <= this.papList.totalPages) {
            // this.isShowLoading=true;
            this.isShowLoading = true
            this.queryPatients()
          } else {
            // 全部加载完时 提醒数据已加载完
            this.noMoreTips = true
            // this.isShowMore=false;
            // 三秒后提示自动消失
            this.timeout = setTimeout(() => {
              this.canLoad = false
              this.noMoreTips = false
              return false
            }, 3000)
          }
        }
      }
    },
    // 移除tooltips插件效果
    destroyTooltip: function () {
      $('[data-tooltip="true"]').tooltip('destroy')
      $('.tooltip').remove()
    },
    // 控制界面展示
    controlPage: function () {
      // loading加载提示隐藏
      this.loading = 1
      // 移除tooltips插件效果
      this.destroyTooltip()

      // 卡片模式
      if (this.listType === 'grid') {
        // 展示对应元素
        $('#patients_list').fadeIn()
        $('#patients_grid').hide()

        // 提示
        $('.showTip').tooltip({
          container: 'body',
          placement: 'auto top'
        })

        // tooltips 卡片鼠标悬浮展示病人更多信息卡片处理
        $('.scrollbar-after-condition .more').tooltip({
          container: 'body',
          html: true,
          delay: {hide: 100},
          placement: 'auto right',
          title: function () {
            return $(this).parent().find('.card-more-details-con').html()
          }
        }).on('shown.bs.tooltip', function (event) { // 鼠标悬浮时处理
          var that = this
          // 该处理控制鼠标能放置到tooltips展示区域上
          $(this).parents('body').find('div.tooltip').on('mouseenter', function () {
            $(that).attr('in', true)
          }).on('mouseleave', function () {
            $(that).removeAttr('in')
            $(that).tooltip('hide')
          })

          // 展示enr时 进行以下处理
          if (this.isShowEnr) {
            // tooltips插件上按钮点击处理
            $(event.currentTarget).parents('body').find('div.tooltip .more-ft>a').unbind('click').on('click', function () {
              // 获取对应的URL
              var urlName = $(event.currentTarget).attr('data-url')
              var url = this.common.getBtnUrl(urlName)
              if (!url) {
                return false
              }
              url += url.indexOf('?') > -1 ? '&' : '?'
              var patIndexNo = $(event.currentTarget).attr('data-patindexno')
              // var host = window.location.protocol + '//' + window.location.host
              // var transPage = host + this.baseUrl + 'transfer/transfer.html'
              $('.ui-sys-bar').css('display', 'none')
              // layer弹窗打开对应的页面
              layer.open({
                type: 2,
                title: false,
                closeBtn: 0,
                area: ['785px', '100%'],
                offset: 'rb', // 右下角弹出
                fixed: true,
                shadeClose: true,
                content: [url + 'wardCode=' + this.common.getUrlParam('wardCode') + '&patIndexNo=' + patIndexNo + '&token=' + this.common.getToken() + '&organCode=' + this.common.getOrganCode() + '&pageFrom=' + this.common.getAppCode()],
                success: function (layero, index) {
                },
                end: function () {
                  // 弹窗关闭后 刷新页面数据
                  $('.ui-sys-bar').css('display', 'block')
                  setTimeout(() => {
                    // this.loading=0;
                    this.queryConditions()
                  }, 10)
                }
              })
            })
          }
        }).on('hide.bs.tooltip', function (event) {
          if ($(this).attr('in')) {
            event.preventDefault()
          }
        })

        // 问题个数 tooltip插件初始化
        $('.sign-num').tooltip({
          container: 'body',
          html: true,
          placement: 'auto right',
          title: function () {
            return $(this).find('.focusList').html()
          }
        })

        // 病人属性 更多 tooltip插件初始化
        $('.am-angle-r').tooltip({
          container: 'body',
          html: true,
          delay: {hide: 100},
          placement: 'auto right',
          title: function () {
            return $(this).find('[data-tooltip="view"]').html()
          }
        })

        // 焦点问题列表展示 通过高度判断 超出高度时 展示查看更多按钮
        $('.am-focus-card .p-list').each(function () {
          if ($(this).height() > 125) {
            $(this).parent().next('.p-more').show()
          }
        })

        // 病人属性默认展示一行 通过高度判断超出一行时展示更多按钮
        $('.iteration-card .txt-type-list').each(function () {
          if ($(this).height() > 40) {
            $(this).find('.am-angle-r').show()
          }
        })

        // 焦点患者卡片翻转效果控制
        $('.am-viewport-flip .front .p-more').click(function (event) {
          $(this).parents('.am-viewport-flip').addClass('active')
          event.stopPropagation()
          event.preventDefault()
        })
        $('.am-viewport-flip .back .p-more').click(function (event) {
          $(this).parents('.am-viewport-flip').removeClass('active')
          event.stopPropagation()
          event.preventDefault()
        })

        // 隔离
        $('.isolate-orders>.am-txt-danger').tooltip({
          container: 'body',
          placement: 'auto top',
          html: true,
          title: function () {
            return $(this).parent().find('[data-tooltip="view"]').html()
          }
        })
      } else { // 列表模式
        // 展示对应元素
        $('.am-tb-fixed-hd').show()
        $('#patients_grid').fadeIn()
        $('#patients_list').hide()
        $('.has-tip').tooltip({
          container: 'body',
          placement: 'auto top'
        })
        // this.setTableTbody();
        $('.scrollbar-after-condition').scroll(function () {
          $('.am-tb-fixed-hd').scrollLeft($(this).scrollLeft())
        })
        $('.am-tb-fixed-hd').css({'width': $('#patients_grid').width()})
        $(window).resize(function () {
          $('.am-tb-fixed-hd').css({'width': $('#patients_grid').width()})
        })
      }

      // 判断界面是否能加载更多数据
      this.canLoadMore()
      this.showMoreMenu()
      // $("#loading").hide();
      // this.common.autoHeight("#patientList");
    },
    /**
     * 列表排序
     * @param {string} type 列表排序字段
     */
    $listSort: function (type) {
      // this.loading=0;
      this.canLoad = false
      this.noMoreTips = false
      // 默认按照升序排序
      var sort = 'ASC'
      // 当前选择排序字段与上次选择排序字段相同时
      if (type === this.listSort.column) {
        // 如果上次排序顺序为降序 默认改成按照床号升序排序
        if (this.listSort.sort === 'DESC') {
          type = 'bedNo'
        } else { // 否则排序顺序改为降序
          sort = 'DESC'
        }
      }
      // 记录当前排序信息
      this.listSort = {column: type, sort: sort}
      this.common.setLocalStorage('PAT_patientSortCol', type)
      this.common.setLocalStorage('PAT_patientSort', sort)

      // this.paList=[];
      // 查询患者
      this.queryPatients(1)
    },
    // 刷新当前数据
    refresh: function () {
      this.loading = 0
      this.canLoad = false
      this.noMoreTips = false
      layer.load(2, {offset: ['50%', '50%']})
      if (this.listType === 'grid') {
        $('#patients_list').hide()
      } else {
        $('#patients_grid').hide()
      }
      layer.load(2, {offset: ['50%', '50%']})
      setTimeout(() => {
        this.queryConditions()
      }, 10)
    },
    /**
     * 切换列表展现模式
     * @param {string} type 模式code
     */
    changeListType: function (type) {
      this.canLoad = false
      this.noMoreTips = false
      // $("#loading").show();
      this.loading = 0
      layer.load(2, {offset: ['50%', '50%']})
      // 记录上次选择列表模式
      this.oldListType = this.listType
      this.listType = type
      this.common.setLocalStorage('PAT_patientListType', this.listType)
      if (type === 'grid') {
        this.papGrid.currentPage = 1
        $('.icon-switch-list').removeClass('active')
        $('#patients_list').fadeIn()
        $('#patients_hide').fadeIn()
      } else {
        this.papList.currentPage = 1
        $('.icon-switch-grid').removeClass('active')
        $('#patients_grid').fadeIn()
        $('#patients_list').hide()
      }
      setTimeout(() => {
        this.queryConditions()
      }, 10)
    },
    // 设置表格tbody宽度
    setTableTbody: function () {
      var width = $('.tableTbody').width()
      $('.tableThead').width(width)
    },
    /**
     * 根据护理等级返回对应的等级标志和样式名
     * @param {string} nursingClass 护理等级值
     * @param {number} type 类型
     */
    showNursingClass: function (nursingClass, type) {
      return this.common.showNursingClass(nursingClass, type)
    },
    /**
     * 根据性别code展示对应性别名称和样式
     * @param {string} sexCode 性别code
     */
    showSex: function (sexCode) {
      return this.common.showSex(sexCode)
    },
    /**
     * 根据病人入院时间计算入院天数
     * @param {string} admissionTime 入院时间
     */
    showInDays: function (admissionTime) {
      return this.common.showInDays(admissionTime)
    },
    /**
     * 根据护理等级展示不同床号样式
     * @param {string} nursingClass 护理等级
     */
    showBedNo: function (nursingClass) {
      return this.common.showBedNo(nursingClass)
    },
    /**
     * 界面跳转
     * @param {object} patient 病人对象
     */
    goTo: function (patient, ev) {
      // 点击打印按钮时 阻止事件冒泡
      if (ev.currentTarget.className.indexOf('flag-print') > -1) {
        return false
      }
      this.destroyTooltip()
      // 由于此页面被iframe引入 所以需要通知父类进行界面跳转
      window.parent.postMessage({patIndexNo: patient.patIndexNo, patientName: patient.name, bedNo: patient.bedNo, event: 'goToPatient'}, '*')
    },
    /**
     * 腕带打印
     * @param {string} patIndexNo 病人编号
     */
    print: function (patIndexNo) {
      this.common.queryPatientInfo({
        data: {patIndexNo: patIndexNo, status: 'in'},
        callback: function (data) {
          if (data && data.length > 0) {
            for (var keyP in data[0]) {
              if (!data[0][keyP]) {
                data[0][keyP] = ''
              }
            }
            // 查询当前病人详细数据
            var patient = data[0]
            // 查询打印模板
            this.printTemplete = this.common.queryPrintTemplete(this.wardCode, patient)
            if (this.common.$getLength(this.printTemplete) > 0) {
              console.log('temp', JSON.stringify(this.printTemplete))
              console.log('data', JSON.stringify(patient))
              // parent.WristStrapPrint(JSON.stringify(this.printTemplete), JSON.stringify(patient));
              // 调用客户端打印方法
              parent.ewellBrowserLabel.printLabel(JSON.stringify(this.printTemplete), JSON.stringify(patient))
              // 打印后回调方法
              this.printCallback(patIndexNo)
              $('.flag-print').tooltip('destroy')
              // 刷新病人数据
              setTimeout(() => {
                this.queryPatients(1)
              }, 10)
            }
          }
        }
      })
    },
    /**
     * 打印后回调方法 调用接口告知该病人腕带已打印
     * @param {string} patIndexNo 病人编号
     */
    printCallback: function (patIndexNo) {
      var param = {
        'wardCode': this.wardCode,
        'patIndexNos': [patIndexNo]
      }
      this.common.ajax({
        url: 'patientinfo-service/patients/bands/result?organCode=' + this.organCode,
        dataType: 'json',
        type: 'post',
        async: false,
        data: JSON.stringify(param),
        callback: function (data) {

        }
      })
    },
    // 下拉加载下一页数据
    pages: function (event) {
      var $this = $(event.currentTarget)
      var viewH = $this.outerHeight()// 可见高度
      var contentH = $this.get(0).scrollHeight// 内容高度
      if (contentH < viewH || this.paList.length === 0) {
        return false
      }

      if (!this.canLoad || this.isShowLoading) {
        this.canLoad = true
        return false
      }
      // this.isShowMore=false;
      var that = $(event.currentTarget)
      // var h = that.height()+40;//div可视区域的高度
      var h = that.outerHeight() + 20
      var sh = that[0].scrollHeight// 滚动的高度，$(this)指代jQuery对象，而$(this)[0]指代的是dom节点
      var st = that[0].scrollTop// 滚动条的高度，即滚动条的当前位置到div顶部的距离
      clearTimeout(this.timeout)
      if (h + st >= sh) {
        console.log('到底了~~')
        // return false;
        if (this.listType === 'grid') {
          this.papGrid.currentPage += 1
          if (this.papGrid.currentPage <= this.papGrid.totalPages) {
            this.isShowLoading = true
            this.queryPatients()
          } else {
            this.noMoreTips = true
            // this.isShowMore=false;
            this.timeout = setTimeout(function () {
              this.canLoad = false
              this.noMoreTips = false
              return false
            }, 3000)
          }
        } else {
          this.papList.currentPage += 1
          if (this.papList.currentPage <= this.papList.totalPages) {
            // this.isShowLoading=true;
            this.isShowLoading = true
            this.queryPatients()
          } else {
            this.noMoreTips = true
            // this.isShowMore=false;
            this.timeout = setTimeout(function () {
              this.canLoad = false
              this.noMoreTips = false
              return false
            }, 3000)
          }
        }
      }
    },
    // 焦点问题展示更多
    showMoreFocus: function () {
      $(event.currentTarget).parents('.am-focus-card').toggleClass('open')
      event.stopPropagation()
      event.preventDefault()
      return false
    },
    // 展示更多菜单按钮
    showMoreMenu: function (isToggle) {
      var filterMore = $('.filter-more')
      if (isToggle) {
        filterMore.toggleClass('active')
        filterMore.parents('.filter-multi').toggleClass('filter-multi-active')
      }
      // debugger
      var amConditionFilter = $('.am-condition-filter')
      var amConditionFilterH = amConditionFilter.outerHeight()
      var filterMultiActive = $('.filter-multi-active')
      var filterMultiActiveH = filterMultiActive.outerHeight()
      var myPatientsBtn = $('.myPatientsBtn')
      var myPatientsBtnH = myPatientsBtn.outerHeight()
      var amTbFixedHd = $('.am-tb-fixed-hd')
      var amTbFixedHdH = amTbFixedHd.outerHeight()
      var scrollbarAfterCondition = $('.scrollbar-after-condition')

      if (filterMore.hasClass('active')) {
        if (this.properCode_F === 'myPatients') {
          myPatientsBtn.css('cssText', 'margin-top:' + (filterMultiActiveH - amConditionFilterH + 10) + 'px !important;')
          if (this.listType === 'grid') {
            scrollbarAfterCondition.css('cssText', 'top:' + (filterMultiActiveH + myPatientsBtnH + 10) + 'px !important;')
          } else {
            scrollbarAfterCondition.css('cssText', 'top:' + (filterMultiActiveH + myPatientsBtnH + 10 + amTbFixedHdH + 10 - 1) + 'px !important;')
          }
        } else {
          if (this.listType === 'grid') {
            scrollbarAfterCondition.css('cssText', 'top:' + filterMultiActiveH + 'px !important;')
          } else {
            amTbFixedHd.css('cssText', 'margin-top:' + (filterMultiActiveH - amConditionFilterH + 20) + 'px !important; display: block;')
            $('.am-tb-fixed-hd').css({'width': $('#patients_grid').width()})
            amTbFixedHdH = amTbFixedHd.outerHeight()
            scrollbarAfterCondition.css('cssText', 'top:' + (filterMultiActiveH + amTbFixedHdH + 20 - 1) + 'px !important;')
          }
        }
      } else {
        if (this.properCode_F === 'myPatients') {
          myPatientsBtn.css('cssText', 'margin-top:' + 10 + 'px !important;')
          myPatientsBtnH = myPatientsBtn.outerHeight()
          if (this.listType === 'grid') {
            scrollbarAfterCondition.css('cssText', 'top:' + (amConditionFilterH + myPatientsBtnH + 10) + 'px !important;')
          } else {
            scrollbarAfterCondition.css('cssText', 'top:' + (amConditionFilterH + myPatientsBtnH + 10 + amTbFixedHdH + 10 - 1) + 'px !important;')
          }
        } else {
          if (this.listType === 'grid') {
            scrollbarAfterCondition.css('cssText', 'top:' + filterMultiActiveH + 'px !important;')
          } else {
            amTbFixedHd.css('cssText', 'margin-top: 20px !important; display:block;')
            $('.am-tb-fixed-hd').css({'width': $('#patients_grid').width()})
            amTbFixedHdH = amTbFixedHd.outerHeight()
            scrollbarAfterCondition.css('cssText', 'top:' + (amConditionFilterH + amTbFixedHdH + 20 - 1) + 'px !important;')
            // scrollbarAfterCondition.css("cssText", 'top:' + filterMultiActiveH + 'px !important;')
          }
        }
      }

      // debugger
      // if ($(this).hasClass('active')) {
      //   var height=$('.filter-multi-active').outerHeight(true);
      //   if (this.properCode_F === 'myPatients') {
      //     $('.myPatientsBtn').css('cssText', 'margin-top:' + (height - 50 + 10) + 'px !important;')
      //     $('.scrollbar-after-condition').css("cssText", 'top:' + (height + $('.myPatientsBtn').height() + 20) + 'px !important;')
      //   }
      // } else {
      //   var height=$('.filter-multi').outerHeight(true);
      //   if (this.properCode_F === 'myPatients') {
      //     $('.myPatientsBtn').css('cssText', 'margin-top:10px !important;')
      //     $('.scrollbar-after-condition').css("cssText", 'top:' + (height + $('.myPatientsBtn').height() + 20) + 'px !important;')
      //   }
      // }
      // height?$('.scrollbar-after-condition').css("top",height):$('.scrollbar-after-condition').css("top","50px");
    },
    getDefaultDictClass: function (defaultDict) {
      var num = 0
      if (defaultDict) {
        for (var i = 0; i < defaultDict.length; i++) {
          if (defaultDict[i].properCode === 'all' || defaultDict[i].properCode === 'myPatients' || defaultDict[i].properCode === 'focus') {
            num += 1
          }
        }
      }
      if (num < 2) {
        return 'am-btn-rdo am-btn-rdo-radius-2'
      } else {
        return 'am-btn-rdo'
      }
    },
    // 展示搜索区域
    showSearch: function () {
      // $('.filter-more').removeClass('active')
      // $('.filter-more').parents('.filter-multi').removeClass('filter-multi-active')
      this.showMoreMenu(true)
      this.isShowSearch = true

      // 搜索区域展示后 点击界面其他区域时 若搜索关键字为空 隐藏搜索区域
      $(document).click((event) => {
        if (this.isShowSearch && !$.trim(this.keyWord_pat)) {
          var eo = $(event.target)
          if (!eo.hasClass('btn-tool-search')) {
            var parents = eo.parents('.am-search-absolute')
            if (parents.length === 0) {
              this.hideSearch()
            }
          }
        }
      })
    },
    // 隐藏搜索区域并清空搜索关键字
    hideSearch: function () {
      this.isShowSearch = false
      this.keyWord_pat = ''
    },
    /**
     * 腕带打印
     * @param {string} patIndexNo 病人编号
     */
    wristPrint: function (patIndexNo) {
      // var patIndexNo=$(this).attr("pNo");
      this.print(patIndexNo)
      event.stopPropagation()
      event.preventDefault()
      return false
    },
    // 展示调试按钮 客户端调试用
    showDevTools: function () {
      parent.showDevTools()
    },
    // 刷新当前页面数据 客户端调试用
    reload: function () {
      window.location.reload()
    },
    // 新增我的患者弹窗
    addMyPatientPop: function () {
      this.loadingBeds = true
      this.queryAllBeds()
      layer.open({
        type: 1,
        title: '选择我的患者',
        area: ['600px', ''],
        fixed: true,
        shadeClose: true,
        maxmin: true,
        content: $('#pop-content-myPatients')
      })
    },
    // 查询当前科室全部床位列表
    queryAllBeds: function () {
      var that = this
      this.common.ajax({
        url: 'patientinfo-service/patients/mybed',
        type: 'get',
        data: {
          organCode: this.organCode,
          wardCode: this.wardCode,
          shiftType: 'none'
        },
        callback: function (result) {
          // 所有床位数据
          that.allBeds = result.Beds
          // 已选择床位数据
          that.selectBeds = result.selectBeds || []
          that.loadingBeds = false
        }
      })
    },
    // 选中床位事件
    checkBed: function (bed, index) {
      // 若该床位已被选中 则取消选中该床位
      if (this.selectBeds.indexOf(bed.bedNo) > -1) {
        this.selectBeds.splice(this.selectBeds.indexOf(bed.bedNo), 1)
        this.allBeds[index].selected = 'false'
      } else { // 否则选中该床位
        this.selectBeds.push(bed.bedNo)
        this.allBeds[index].selected = 'true'
      }
    },
    // 全选床位
    checkAllBed: function () {
      // 若床位列表为空 不处理数据
      if (this.allBeds.length === 0) {
        this.selectBeds = []
        return false
      }
      // 若当前床位全都选中时 取消选择所有床位 并进行相关数据处理
      if (this.allBeds.length === this.selectBeds.length) {
        for (var i = 0; i < this.allBeds.length; i++) {
          this.allBeds[i].selected = 'false'
        }
        this.selectBeds = []
      } else { // 选中所有床位 并进行相关数据处理
        this.selectBeds = []
        for (var j = 0; j < this.allBeds.length; j++) {
          this.allBeds[j].selected = 'true'
          this.selectBeds.push(this.allBeds[j].bedNo)
        }
      }
    },
    // 新增我的床位
    addMyBed: function () {
      var that = this
      var param = {
        'bedNos': this.selectBeds,
        'loginId': this.common.getLoginId(),
        'wardCode': this.wardCode,
        'shiftType': 'none'
      }
      this.common.ajax({
        url: 'common-service/user/v1/beds',
        type: 'post',
        data: JSON.stringify(param),
        callback: function (result) {
          layer.closeAll()
          that.common.tip_msg('操作成功！')
          that.queryConditions()
        }
      })
    },
    /**
     * 是否为默认菜单
     * @param {string} menuCode 菜单code
     */
    isDefaultMenu: function (menuCode) {
      return this.defaultMenuCode.indexOf(menuCode)
    }
  }
}
</script>

<style scoped>
</style>
